use core::array::{ArrayTrait, SpanTrait};
use dojo::test_utils::spawn_test_world;
use dojo::world::{IWorldDispatcher, IWorldDispatcherTrait};
use eternum::models::capacity::{capacity, Capacity};

use eternum::models::config::{
    world_config, WorldConfig, speed_config, SpeedConfig, capacity_config, CapacityConfig,
    weight_config, WeightConfig, road_config, RoadConfig, hyperstructure_resource_config,
    HyperstructureResourceConfig, stamina_config, StaminaConfig, tick_config, TickConfig,
    MercenariesConfig
};
use eternum::models::hyperstructure::{Progress, progress, Contribution, contribution};
use eternum::models::metadata::{entity_metadata, EntityMetadata};
use eternum::models::metadata::{foreign_key, ForeignKey};
use eternum::models::movable::{movable, Movable, arrival_time, ArrivalTime};
use eternum::models::owner::{owner, Owner};
use eternum::models::position::{position};
use eternum::models::quantity::{quantity, Quantity, quantity_tracker, QuantityTracker};
use eternum::models::realm::{realm, Realm};
use eternum::models::resources::{resource, Resource};
use eternum::models::resources::{resource_cost, ResourceCost};
use eternum::models::road::{road, Road};
use eternum::models::trade::{status, Status, trade, Trade,};

// used to spawn a test world with all the models and systems registered
fn spawn_eternum() -> IWorldDispatcher {
    let mut models = array![
        owner::TEST_CLASS_HASH,
        movable::TEST_CLASS_HASH,
        quantity::TEST_CLASS_HASH,
        realm::TEST_CLASS_HASH,
        speed_config::TEST_CLASS_HASH,
        capacity_config::TEST_CLASS_HASH,
        world_config::TEST_CLASS_HASH,
        entity_metadata::TEST_CLASS_HASH,
        quantity_tracker::TEST_CLASS_HASH,
        position::TEST_CLASS_HASH,
        capacity::TEST_CLASS_HASH,
        arrival_time::TEST_CLASS_HASH,
        foreign_key::TEST_CLASS_HASH,
        trade::TEST_CLASS_HASH,
        resource::TEST_CLASS_HASH,
        resource_cost::TEST_CLASS_HASH,
        status::TEST_CLASS_HASH,
        weight_config::TEST_CLASS_HASH,
        road::TEST_CLASS_HASH,
        road_config::TEST_CLASS_HASH,
        progress::TEST_CLASS_HASH,
        contribution::TEST_CLASS_HASH,
        hyperstructure_resource_config::TEST_CLASS_HASH,
        stamina_config::TEST_CLASS_HASH,
        tick_config::TEST_CLASS_HASH,
    ];

    let world = spawn_test_world(models);

    world.uuid();

    world
}
