CREATE VIEW player_infos AS
Select 
T.player_id,
T.status,
T.status_total,
T.status_count,
TT.total_payout
from (
select 
player_id, 
status, 
count(status)status_count,
SUM(payout)status_total 
from 
Hands 
GROUP BY  player_id, status
)T
INNER JOIN (
select 
    player_id,
    SUM(payout)total_payout 
from 
    Hands
GROUP BY  player_id
)TT
ON T.player_id = TT.player_id

