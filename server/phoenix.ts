
const { Pool } = require('pg')

export default class Phoenix {

  private pool: any;

  private static instance: Phoenix;

  static getInstance(): Phoenix {
    if (!Phoenix.instance) {
      Phoenix.instance = new Phoenix();
    }
    return Phoenix.instance;
  }

  private constructor() {
    this.pool = new Pool({
      user: process.env.DBUSER,
      host: process.env.DBHOST,
      database: process.env.DBNAME,
      password: process.env.DBPWD,
      port: 5432,
      ssl: { rejectUnauthorized: false }
    });
  }

  //AGG. VOLUME BY DAYSLOT

  public aggregateVolumeByDayslot7Day = async () => {
    const res = await this.pool.query(`
      select hourslot/100 , sum(eth_volume) as eth_vol, sum(delta_volume) as delta_vol, sum(link_volume) as link_vol, sum(snx_volume) as snx_vol, sum(wbtc_volume) as wbtc_vol
      from phoenix_tx_monitor
      where to_timestamp("timestamp") > now() - interval '7 day' 
      and op_type = 1 --swap
      group by hourslot/100  
      order by hourslot/100  desc;`);
    await this.pool.end()
    return res.rows;
  }

  public aggregateVolumeByDayslot1Day = async () => {
    const res = await this.pool.query(`
      select hourslot/100 , sum(eth_volume) as eth_vol, sum(delta_volume) as delta_vol, sum(link_volume) as link_vol, sum(snx_volume) as snx_vol, sum(wbtc_volume) as wbtc_vol
      from phoenix_tx_monitor
      where to_timestamp("timestamp") > now() - interval '1 month'
      and op_type = 1 --swap
      group by hourslot/100  
      order by hourslot/100  desc;`);
    await this.pool.end()
    return res.rows;
  }

  //AGG. VOLUME BY HOURSLOT

  public volumeByHourslot1Day = async () => {
    const res = await this.pool.query(`
      select hourslot, sum(eth_volume) as eth_vol, sum(delta_volume) as delta_vol, sum(link_volume) as link_vol, sum(snx_volume) as snx_vol, sum(wbtc_volume) as wbtc_vol
      from phoenix_tx_monitor
      where to_timestamp("timestamp") > now() - interval '1 day' 
      and op_type = 1 --swap
      group by hourslot 
      order by hourslot desc;`);
    await this.pool.end();
    return res.rows;
  }    

  public volumeByHourslot7Days = async () => {
    const res = await this.pool.query(`
      select hourslot, sum(eth_volume) as eth_vol, sum(delta_volume) as delta_vol, sum(link_volume) as link_vol, sum(snx_volume) as snx_vol, sum(wbtc_volume) as wbtc_vol
      from phoenix_tx_monitor
      where to_timestamp("timestamp") > now() - interval '7 day' 
      and op_type = 1 --swap
      group by hourslot 
      order by hourslot desc;`);
    await this.pool.end();
    return res.rows;
  }
 
  public volumeByHourslot1Month = async () => {
    const res = await this.pool.query(`
      select hourslot, sum(eth_volume) as eth_vol, sum(delta_volume) as delta_vol, sum(link_volume) as link_vol, sum(snx_volume) as snx_vol, sum(wbtc_volume) as wbtc_vol
      from phoenix_tx_monitor
      where to_timestamp("timestamp") > now() - interval '1 month'
      and op_type = 1 --swap
      group by hourslot
      order by hourslot desc;`);
    await this.pool.end();
    return res.rows;
  }

//VOLUME BY TIMESTAMP dataset
//-- op_type = 1 -> swaps

  public volumeByTimestamp24 = async () => {
    const res = await this.pool.query(`
      select timestamp, eth_volume, delta_volume, link_volume, snx_volume, wbtc_volume
      from phoenix_tx_monitor
      where to_timestamp("timestamp") > now() - interval '1 day' 
      and op_type = 1 --swap
      order by timestamp desc, rn asc;`);
    await this.pool.end();
    return res.rows;
  }

  //--delta volume 7d 
  public volumeByTimestamp7Days = async () => {
    const res = await this.pool.query(`
      select timestamp, eth_volume, delta_volume, link_volume, snx_volume, wbtc_volume
      from phoenix_tx_monitor
      where to_timestamp("timestamp") > now() - interval '7 day' 
      and op_type = 1 --swap
      order by timestamp desc, rn asc;`);
    await this.pool.end();
    return res.rows;
  }

  //--delta volume 1 month
  public volumeByTimestamp1Month = async () => {
    const res = await this.pool.query(`
      select timestamp, eth_volume, delta_volume, link_volume, snx_volume, wbtc_volume
      from phoenix_tx_monitor
      where to_timestamp("timestamp") > now() - interval '1 month'
      and op_type = 1 --swap
      order by timestamp desc, rn asc;`);
    await this.pool.end();
    return res.rows;
  }

//COST IN TOKENS OF MINTING BPT BY TIMESTAMP ------------------------------------------------------
  public currentCostOfMintingBPTByTimestamp = async () => {
    const res = await this.pool.query(`
      select timestamp
        , eth_balance/phoenix_supply as eth_cost
        , delta_balance/phoenix_supply as delta_cost
        , link_balance/phoenix_supply as link_cost
        , snx_balance/phoenix_supply as snx_cost
        , wbtc_balance/phoenix_supply as wbtc_cost
      from phoenix_tx_monitor
      where rn = 1
      order by timestamp desc;`);
    await this.pool.end();
    return res.rows; 
  }

  public costOfMintingBPTByTimestamp1DayAgo = async () => {
    const res = await this.pool.query(`
      select timestamp
        , eth_balance/phoenix_supply as eth_cost
        , delta_balance/phoenix_supply as delta_cost
        , link_balance/phoenix_supply as link_cost
        , snx_balance/phoenix_supply as snx_cost
        , wbtc_balance/phoenix_supply as wbtc_cost
    from phoenix_tx_monitor
    where to_timestamp("timestamp") <  now() - interval '1 day' 
    and rn = 1
    order by timestamp desc;`);
    await this.pool.end();
    return res.rows; 
  }

  public costOfMintingBPTaByTimestamp7DaysAgo = async () => {
    const res = await this.pool.query(`
      select timestamp,
        , eth_balance/phoenix_supply as eth_cost
        , delta_balance/phoenix_supply as delta_cost
        , link_balance/phoenix_supply as link_cost
        , snx_balance/phoenix_supply as snx_cost
        , wbtc_balance/phoenix_supply as wbtc_cost
    from phoenix_tx_monitor
    where to_timestamp("timestamp") < now() - interval '7 days'
    and rn = 1 
    order by timestamp desc;`);
    await this.pool.end();
    return res.rows; 
  }

  public costOfMintingBPTByTimestamp1MonthAgo = async () => {
    const res = await this.pool.query(`
      select timestamp,
        , eth_balance/phoenix_supply as eth_cost
        , delta_balance/phoenix_supply as delta_cost
        , link_balance/phoenix_supply as link_cost
        , snx_balance/phoenix_supply as snx_cost
        , wbtc_balance/phoenix_supply as wbtc_cost
    from phoenix_tx_monitor
    where to_timestamp("timestamp") < now() - interval '1 month'
    and rn = 1 
    order by timestamp desc;`);
    await this.pool.end();
    return res.rows; 
  }

//DATASET OF BALANCE BY TIMESTAMP
//-- Total liquidity can be calculated through eth_balance * 2
//--current snapshot
  public currentBalance = async () => {
    const res = await this.pool.query(`
      select timestamp, eth_balance, delta_balance, link_balance, snx_balance, wbtc_balance
      from phoenix_tx_monitor 
      where rn = 1
      order by timestamp desc
      limit 1;`);
    await this.pool.end();
    return res.rows;
  }

  public balance24 = async () => {
    const res = await this.pool.query(`
      select timestamp, eth_balance, delta_balance, link_balance, snx_balance, wbtc_balance 
      from phoenix_tx_monitor
      where to_timestamp("timestamp") > now() - interval '1 day' 
      and rn = 1
      order by timestamp desc;`);
    await this.pool.end();
    return res.rows;
  }

  public balance7days = async () => {
    const res = await this.pool.query(`
      select timestamp, eth_balance, delta_balance, link_balance, snx_balance, wbtc_balance
      from phoenix_tx_monitor
      where to_timestamp("timestamp") > now() - interval '7 day' 
      and rn = 1
      order by timestamp desc;`);
    await this.pool.end();
    return res.rows;
  }

  public balance1Month = async () => {
    const res = await this.pool.query(`
      select timestamp, eth_balance, delta_balance, link_balance, snx_balance, wbtc_balance
      from phoenix_tx_monitor
      where to_timestamp("timestamp") > now() - interval '1 month' 
      and rn = 1
      order by timestamp desc;`);
    await this.pool.end();
    return res.rows;
  } 
}
