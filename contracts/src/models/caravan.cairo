#[derive(Model, Copy, Drop, Serde)]
struct CaravanMembers {
    #[key]
    entity_id: u128,
    key: u128,
    count: u32,
}