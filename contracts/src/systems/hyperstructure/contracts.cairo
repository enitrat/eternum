use eternum::alias::ID;
use eternum::models::position::Coord;
use starknet::ContractAddress;

#[dojo::interface]
trait IHyperstructureSystems {
    fn create(ref world: IWorldDispatcher, creator_entity_id: ID, coord: Coord) -> ID;
    fn contribute_to_construction(
        ref world: IWorldDispatcher,
        hyperstructure_entity_id: ID,
        contributor_entity_id: ID,
        contributions: Span<(u8, u128)>
    );
    fn set_co_owners(
        ref world: IWorldDispatcher, hyperstructure_entity_id: ID, co_owners: Span<(ContractAddress, u16)>
    );
}


#[dojo::contract]
mod hyperstructure_systems {
    use core::array::ArrayIndex;
    use eternum::{
        alias::ID, constants::{HYPERSTRUCTURE_CONFIG_ID, ResourceTypes, get_resources_without_earthenshards},
        models::{
            config::{HyperstructureResourceConfigCustomTrait, HyperstructureConfig},
            hyperstructure::{Progress, Contribution, HyperstructureUpdate},
            owner::{Owner, OwnerCustomTrait, EntityOwner, EntityOwnerCustomTrait},
            position::{Coord, Position, PositionIntoCoord}, realm::{Realm},
            resources::{Resource, ResourceCustomImpl, ResourceCost},
            structure::{Structure, StructureCount, StructureCountCustomTrait, StructureCategory}
        },
        systems::{transport::contracts::travel_systems::travel_systems::InternalTravelSystemsImpl},
    };
    use starknet::ContractAddress;

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    #[dojo::model]
    struct HyperstructureFinished {
        #[key]
        hyperstructure_entity_id: ID,
        timestamp: u64,
    }

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    #[dojo::model]
    struct HyperstructureCoOwnersChange {
        #[key]
        hyperstructure_entity_id: ID,
        timestamp: u64,
        co_owners: Span<(ContractAddress, u16)>,
    }


    #[abi(embed_v0)]
    impl HyperstructureSystemsImpl of super::IHyperstructureSystems<ContractState> {
        fn create(ref world: IWorldDispatcher, creator_entity_id: ID, coord: Coord) -> ID {
            get!(world, creator_entity_id, Owner).assert_caller_owner();

            InternalTravelSystemsImpl::assert_tile_explored(world, coord);

            // assert no structure is already built on the coords
            let structure_count: StructureCount = get!(world, coord, StructureCount);
            structure_count.assert_none();

            let hyperstructure_shards_config = HyperstructureResourceConfigCustomTrait::get(
                world, ResourceTypes::EARTHEN_SHARD
            );

            let mut creator_resources = ResourceCustomImpl::get(
                world, (creator_entity_id, ResourceTypes::EARTHEN_SHARD)
            );

            creator_resources.burn(hyperstructure_shards_config.amount_for_completion);
            creator_resources.save(world);

            let new_uuid: ID = world.uuid();

            set!(
                world,
                (
                    Structure { entity_id: new_uuid, category: StructureCategory::Hyperstructure },
                    StructureCount { coord, count: 1 },
                    Position { entity_id: new_uuid, x: coord.x, y: coord.y },
                    Owner { entity_id: new_uuid, address: starknet::get_caller_address() },
                    EntityOwner { entity_id: new_uuid, entity_owner_id: new_uuid },
                    Progress {
                        hyperstructure_entity_id: new_uuid,
                        resource_type: ResourceTypes::EARTHEN_SHARD,
                        amount: hyperstructure_shards_config.amount_for_completion
                    },
                    Contribution {
                        hyperstructure_entity_id: new_uuid,
                        player_address: starknet::get_caller_address(),
                        resource_type: ResourceTypes::EARTHEN_SHARD,
                        amount: hyperstructure_shards_config.amount_for_completion
                    }
                )
            );

            new_uuid
        }

        fn contribute_to_construction(
            ref world: IWorldDispatcher,
            hyperstructure_entity_id: ID,
            contributor_entity_id: ID,
            contributions: Span<(u8, u128)>
        ) {
            get!(world, contributor_entity_id, Owner).assert_caller_owner();

            let structure = get!(world, hyperstructure_entity_id, Structure);
            assert(structure.category == StructureCategory::Hyperstructure, 'not a hyperstructure');

            let mut i = 0;
            let mut resource_was_completed = false;
            while (i < contributions.len()) {
                let contribution = *contributions.at(i);

                resource_was_completed = resource_was_completed
                    | InternalHyperstructureSystemsImpl::handle_contribution(
                        world, hyperstructure_entity_id, contribution, contributor_entity_id
                    );
                i += 1;
            };

            if (resource_was_completed
                && InternalHyperstructureSystemsImpl::check_if_construction_done(world, hyperstructure_entity_id)) {
                let timestamp = starknet::get_block_timestamp();
                emit!(world, (HyperstructureFinished { hyperstructure_entity_id, timestamp }),);
            }
        }

        fn set_co_owners(
            ref world: IWorldDispatcher, hyperstructure_entity_id: ID, co_owners: Span<(ContractAddress, u16)>
        ) {
            let caller = starknet::get_caller_address();

            let owner = get!(world, hyperstructure_entity_id, Owner);
            owner.assert_caller_owner();

            let hyperstructure_config = get!(world, HYPERSTRUCTURE_CONFIG_ID, HyperstructureConfig);

            let mut hyperstructure_update = get!(world, hyperstructure_entity_id, HyperstructureUpdate);

            let timestamp = starknet::get_block_timestamp();

            if (hyperstructure_update.last_updated_by == caller) {
                assert!(
                    timestamp
                        - hyperstructure_update
                            .last_updated_timestamp > hyperstructure_config
                            .time_between_shares_change,
                    "time between shares change not passed"
                );
            }

            hyperstructure_update.last_updated_timestamp = timestamp;
            hyperstructure_update.last_updated_by = caller;

            set!(world, (hyperstructure_update,));

            let mut total: u16 = 0;
            let mut i = 0;
            while (i < co_owners.len()) {
                let (address, percentage) = *co_owners.at(i);
                total += percentage;
                i += 1;
            };
            assert!(total == 10000, "total percentage must be 10000");
            emit!(world, (HyperstructureCoOwnersChange { hyperstructure_entity_id, timestamp, co_owners }));
        }
    }

    #[generate_trait]
    pub impl InternalHyperstructureSystemsImpl of InternalHyperstructureSystemsTrait {
        fn handle_contribution(
            world: IWorldDispatcher, hyperstructure_entity_id: ID, contribution: (u8, u128), contributor_entity_id: ID
        ) -> bool {
            let (resource_type, contribution_amount) = contribution;

            let (max_contributable_amount, will_complete_resource) = Self::get_max_contribution_size(
                world, hyperstructure_entity_id, resource_type, contribution_amount
            );

            if (max_contributable_amount == 0) {
                return false;
            }

            Self::add_contribution(world, hyperstructure_entity_id, resource_type, max_contributable_amount,);
            Self::burn_player_resources(world, resource_type, max_contributable_amount, contributor_entity_id);

            Self::update_progress(world, hyperstructure_entity_id, resource_type, max_contributable_amount);

            return will_complete_resource;
        }

        fn burn_player_resources(
            world: IWorldDispatcher, resource_type: u8, resource_amount: u128, contributor_entity_id: ID
        ) {
            let mut creator_resources = ResourceCustomImpl::get(world, (contributor_entity_id, resource_type));

            creator_resources.burn(resource_amount);
            creator_resources.save(world);
        }

        fn get_max_contribution_size(
            world: IWorldDispatcher, hyperstructure_entity_id: ID, resource_type: u8, resource_amount: u128
        ) -> (u128, bool) {
            let resource_progress = get!(world, (hyperstructure_entity_id, resource_type), Progress);
            let hyperstructure_resource_config = HyperstructureResourceConfigCustomTrait::get(world, resource_type);
            let resource_amount_for_completion = hyperstructure_resource_config.amount_for_completion;

            let amount_left_for_completion = resource_amount_for_completion - resource_progress.amount;

            let max_contributable_amount = core::cmp::min(amount_left_for_completion, resource_amount);

            let will_complete_resource = resource_amount >= amount_left_for_completion;
            (max_contributable_amount, will_complete_resource)
        }

        fn add_contribution(
            world: IWorldDispatcher, hyperstructure_entity_id: ID, resource_type: u8, resource_amount: u128,
        ) {
            let player_address = starknet::get_caller_address();
            let mut contribution = get!(world, (hyperstructure_entity_id, player_address, resource_type), Contribution);
            contribution.amount += resource_amount;

            set!(world, (contribution,));
        }

        fn update_progress(
            world: IWorldDispatcher, hyperstructure_entity_id: ID, resource_type: u8, resource_amount: u128,
        ) {
            let mut resource_progress = get!(world, (hyperstructure_entity_id, resource_type), Progress);
            resource_progress.amount += resource_amount;
            set!(world, (resource_progress,));
        }

        fn check_if_construction_done(world: IWorldDispatcher, hyperstructure_entity_id: ID) -> bool {
            let mut done = true;
            let all_resources = get_resources_without_earthenshards();

            let mut i = 0;
            while (i < all_resources.len()) {
                done = Self::check_if_resource_completed(world, hyperstructure_entity_id, *all_resources.at(i));
                if (done == false) {
                    break;
                }
                i += 1;
            };

            return done;
        }

        fn check_if_resource_completed(
            world: IWorldDispatcher, hyperstructure_entity_id: ID, resource_type: u8
        ) -> bool {
            let mut resource_progress = get!(world, (hyperstructure_entity_id, resource_type), Progress);

            let hyperstructure_resource_config = HyperstructureResourceConfigCustomTrait::get(world, resource_type);
            let resource_amount_for_completion = hyperstructure_resource_config.amount_for_completion;

            resource_progress.amount == resource_amount_for_completion
        }
    }
}
