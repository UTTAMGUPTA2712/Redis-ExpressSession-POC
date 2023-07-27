# IMPLIMENT REDIS IN SERVER

## REDIS_CLI COMMANDS

### KEYS

`SET keyname data`
-   set key value
`GET keyname`
-   get key value
`TTL keyname`
-   expiring time of key (-1 means never||-2 means already deleted)
`EXPIRE keyname timeinsec`
-   set time after which key expires
`KEYS *`
- shows all key
`FLUSHALL`
- clears out redis

### ARRAY

`LPUSH varname data`
-   push in array
`LRANGE varname startindex endindex(-1 for all)`
-   get values in array
`RPOP varname`
-   remove top value in array

### SET

`SADD varname data`
-   push in set
`SMEMBERS varname`
-   get values in set
`SREM varname data`
-   remove in array

### HASMAP

`HSET varname keyname data`
-   set key and data in hashmap
`HGET varname keyname`
-   get key and data in hashmap
`HGETALL varname`
-   get all key and data in hashmap
`HDEL varname keyname`
-   delete key and data in hashmap
`HEXISTS varname keyname`
-   checks for key and data in hashmap
