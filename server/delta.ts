
const { Pool } = require('pg')

export default class Delta {

  private pool: any;

  private static instance: Delta;

  static getInstance(): Delta {
    if (!Delta.instance) {
      Delta.instance = new Delta();
    }
    return Delta.instance;
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

  public volume1Month = async () => {
    console.log("aggregateVolume7Day");
    const res = await this.pool.query(`
      select hourslot/100 , sum(eth_volume), sum(sta_volume)
      from delta_tx_monitor
      where to_timestamp("timestamp") > now() - interval '1 month'
      and op_type = 1 --swap
      group by hourslot/100  
      order by hourslot/100  desc;`);
    
    return res.rows;
  }

  public volume1Week = async () => {
    const res = await this.pool.query(`
      select hourslot/100 , sum(eth_volume), sum(sta_volume)
      from delta_tx_monitor
      where to_timestamp("timestamp") > now() - interval '7 day' 
      and op_type = 1 --swap
      group by hourslot/100  
      order by hourslot/100  desc;`);
    
    return res.rows;
  }

//AGG. VOLUME BY HOURSLOT

  public volumeByHourslot1Day = async () => {
    const res = await this.pool.query(`
      select hourslot, sum(eth_volume), sum(sta_volume)
      from delta_tx_monitor
      where to_timestamp("timestamp") > now() - interval '1 day' 
      and op_type = 1 --swap
      group by hourslot 
      order by hourslot desc;`);
    
    return res.rows;
  }    

  public volumeByHourslot7Days = async () => {
    const res = await this.pool.query(`
      select hourslot, sum(eth_volume), sum(sta_volume)
      from delta_tx_monitor
      where to_timestamp("timestamp") > now() - interval '7 day' 
      and op_type = 1 --swap
      group by hourslot 
      order by hourslot desc;`);
    
    return res.rows;
  }
 
  public volumeByHourslot1Month = async () => {
    const res = await this.pool.query(`
      select hourslot, sum(eth_volume), sum(sta_volume)
      from delta_tx_monitor
      where to_timestamp("timestamp") > now() - interval '1 month'
      and op_type = 1 --swap
      group by hourslot
      order by hourslot desc;`);
    
    return res.rows;
  }

  //VOLUME BY TIMESTAMP dataset ---------------------------------------------------------------------
  // op_type = 1 -> swaps
  //--delta volume 24h
  public volumeByTimestamp24 = async () => {
    const res = await this.pool.query(`
      select timestamp, eth_volume, sta_volume
      from delta_tx_monitor
      where to_timestamp("timestamp") > now() - interval '1 day' 
      and op_type = 1 --swap
      order by timestamp desc, rn asc;`);
    
    return res.rows;
  }

  //--delta volume 7d 
  public volumeByTimestamp7Days = async () => {
    const res = await this.pool.query(`
      select timestamp, eth_volume, sta_volume
      from delta_tx_monitor
      where to_timestamp("timestamp") > now() - interval '7 day' 
      and op_type = 1 --swap
      order by timestamp desc, rn asc;`);
    
    return res.rows;
  }

  //--delta volume 1 month
  public volumeByTimestamp1Month = async () => {
    const res = await this.pool.query(`
      select timestamp, eth_volume, sta_volume
      from delta_tx_monitor
      where to_timestamp("timestamp") > now() - interval '1 month'
      and op_type = 1 --swap
      order by timestamp desc, rn asc;`);
    
    return res.rows;
  }

//DATASET OF BALANCE BY TIMESTAMP
//-- Total liquidity can be calculated through eth_balance * 2
//--current snapshot
  public currentBalance = async () => {
    const res = await this.pool.query(`
      select timestamp, eth_balance, sta_balance 
      from delta_tx_monitor 
      where rn = 1
      order by timestamp desc
      limit 1; `);
    
    return res.rows;
  }

  public balance24 = async () => {
    const res = await this.pool.query(`
      select timestamp, eth_balance, sta_balance 
      from delta_tx_monitor
      where to_timestamp("timestamp") > now() - interval '1 day' 
      and rn = 1
      order by timestamp desc;`);
    
    return res.rows;
  }

  public balance7days = async () => {
    const res = await this.pool.query(`
      select timestamp, eth_balance, sta_balance
      from delta_tx_monitor
      where to_timestamp("timestamp") > now() - interval '7 day' 
      and rn = 1
      order by timestamp desc;`);
    
    return res.rows;
  }

  public balance1Month = async () => {
    const res = await this.pool.query(`
      select timestamp, eth_balance, sta_balance
      from delta_tx_monitor
      where to_timestamp("timestamp") > now() - interval '1 month' 
      and rn = 1
      order by timestamp desc;`);
    
    return res.rows;
  } 

//COST IN TOKENS OF MINTING DELTA BY TIMESTAMP ------------------------------------------------------
  public currentCostOfMintingDeltaByTimestamp = async () => {
    const res = await this.pool.query(`
      select timestamp, eth_balance/delta_supply as eth_cost, sta_balance/delta_supply as sta_cost
      from delta_tx_monitor
      where rn = 1
      order by timestamp desc`);
    
    return res.rows; 
  }

  public costOfMintingDeltaByTimestamp1DayAgo = async () => {
    const res = await this.pool.query(`
      select timestamp, eth_balance/delta_supply as eth_cost, sta_balance/delta_supply as sta_cost
      from delta_tx_monitor
      where to_timestamp("timestamp") <  now() - interval '1 day' 
      and rn = 1
      order by timestamp desc;`);
    
    return res.rows; 
  }

  public costOfMintingDeltaByTimestamp7DaysAgo = async () => {
    const res = await this.pool.query(`
      select timestamp, eth_balance/delta_supply as eth_cost, sta_balance/delta_supply as sta_cost
      from delta_tx_monitor
      where to_timestamp("timestamp") < now() - interval '7 days'
      and rn = 1 
      order by timestamp desc;`);
    
    return res.rows; 
  }

  public costOfMintingDeltaByTimestamp1MonthAgo = async () => {
    const res = await this.pool.query(`
      select timestamp, eth_balance/delta_supply as eth_cost, sta_balance/delta_supply as sta_cost
      from delta_tx_monitor
      where to_timestamp("timestamp") < now() - interval '1 month'
      and rn = 1 
      order by timestamp desc;`);
    
    return res.rows; 
  }
}
