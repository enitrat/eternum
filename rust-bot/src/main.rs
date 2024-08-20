mod commands;
mod types;
use poise::serenity_prelude as serenity;
use serenity::futures::StreamExt;
use serenity::model::id::{ChannelId, GuildId, UserId};
use sqlx::SqlitePool;
use std::convert::TryInto;
use std::sync::Arc;
use tokio::sync::mpsc;

type Error = Box<dyn std::error::Error + Send + Sync>;
type Context<'a> = poise::Context<'a, Data, Error>;
use serenity::builder::{CreateAttachment, CreateEmbed, CreateEmbedFooter, CreateMessage};
use serenity::model::Timestamp;
use starknet_crypto::Felt;
use torii_client::client::Client;
use torii_grpc::proto::types::Ty;
use torii_grpc::{
    client::EntityUpdateStreaming,
    types::{schema::Entity, EntityKeysClause, KeysClause},
};

use dojo_types::primitive::Primitive::ContractAddress;

use crate::types::{process_event, EventHandler, MessageDispatcher};

struct Data {
    database: SqlitePool,
}

async fn check_user_in_database(
    pool: &SqlitePool,
    address: &str,
) -> Result<Option<Option<std::string::String>>, sqlx::Error> {
    sqlx::query_scalar!("SELECT discord FROM users WHERE address = ?", address)
        .fetch_optional(pool)
        .await
}

async fn setup_torii_client(token: String, database: SqlitePool) {
    let torii_url = "http://0.0.0.0:8080".to_string();
    let rpc_url = "http://0.0.0.0:5050".to_string();
    let relay_url = "/ip4/127.0.0.1/tcp/9090".to_string();
    let world = Felt::from_hex_unchecked(
        "0x5889930b9e39f7138c9a16b4a68725066a53970d03dfda280a9e479e3d8c2ac",
    );

    tokio::spawn(async move {
        let http = serenity::Http::new(&token.clone());
        println!("Setting up Torii client");
        let client = Client::new(torii_url, rpc_url, relay_url, world)
            .await
            .unwrap();

        let mut rcv = client
            .on_event_message_updated(vec![EntityKeysClause::Keys(KeysClause {
                keys: vec![],
                pattern_matching: torii_grpc::types::PatternMatching::VariableLen,
                models: vec![],
            })])
            .await
            .unwrap();

        let (event_sender, mut event_receiver) = mpsc::channel(100);
        let (message_sender, message_receiver) = mpsc::channel(100);

        let event_handler = EventHandler {
            event_sender,
            database: database.clone(),
        };
        let mut message_dispatcher = MessageDispatcher {
            http: Arc::new(serenity::Http::new(&token)),
            message_receiver,
        };

        tokio::spawn(async move {
            while let Some(event) = event_receiver.recv().await {
                process_event(event, &database, &message_sender).await;
            }
        });

        tokio::spawn(async move {
            message_dispatcher.run().await;
        });

        while let Some(Ok((_, entity))) = rcv.next().await {
            event_handler.handle_event(entity).await;
        }
    });

    println!("Torii client setup task spawned");
}

#[tokio::main]
async fn main() {
    let token = std::env::var("DISCORD_TOKEN").expect("missing DISCORD_TOKEN");
    let token_clone = token.clone();
    let database_url = std::env::var("DATABASE_URL").expect("missing DATABASE_URL");
    let intents = serenity::GatewayIntents::non_privileged();

    let database = SqlitePool::connect(&database_url)
        .await
        .expect("Failed to connect to the database");

    let framework = poise::Framework::builder()
        .options(poise::FrameworkOptions {
            commands: vec![
                commands::add_user::add_user(),
                commands::update_user::update_user(),
                commands::get_user::get_user(),
            ],
            ..Default::default()
        })
        .setup(|ctx, _ready, framework| {
            Box::pin(async move {
                poise::builtins::register_globally(ctx, &framework.options().commands).await?;
                setup_torii_client(token_clone, database.clone()).await;
                Ok(Data { database })
            })
        })
        .build();

    let client = serenity::ClientBuilder::new(token, intents)
        .framework(framework)
        .await;
    client.unwrap().start().await.unwrap();
}
