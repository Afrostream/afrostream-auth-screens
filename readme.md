# Description

this package is used for the screen limit lock.

the player is pooling http://auth-screens.afrostream.tv/api/v1/screens/current returning a boolean

```json
{
  "authorized": boolean
}
```

if authorized is define & true => the player can play the video.

# Api

## GET /auth/screens/current

return if the current screen is authorized or not

```json
{
  "authorized": true,
  "uuid": "a4223fbc8d"
}
```

This url should be called every 10sec by the player.
This url will set a cookie "screen" on .afrostream.tv
cookie content: {uuid:string,userId:string,plan:string,expiration:int}
this cookie is "signed".

Algorithm:
```
if (no cookie or expired) // this avoid a database user fetch on every hit.
then
  log the user
  if (user auth error) 
  then 
      send { authorized:false }
  fi
  if (database error or redis error or system error)
  then
      send { authorized:true }
  fi
  uuid = generate a screen uuid
  addScreen(user.id, uuid):
  checkAuth(user.id, user.plan):
  setCookie(uuid, user.id, user.plan)
else
   addScreen(cookie.userId, cookie.uuid)
   checkAuth(cookie.userId, cookie.plan)
   setCookie(cookie.uuid, cookie.userId, cookie.plan)
fi

setCookie(uuid, userId, plan)
  expiration = Date().now() + 20sec
  key = computeKey(uuid, userId, plan, expiration)
  res.setCookie('screen', {uuid:string,userId:string,plan:string,expiration:int}, signed)

addScreen(userId, uuid):
   data = JSON.stringify({ua: userAgent, ip: ip, now: Date.now().toISOString() })
   redis.set('user.{userId}.screens.{uuid}', data, 20sec);

checkAuth(userId, plan):
   redis.keys('user.{userId}.screens.*');
   // count the number of screens
   if (nb redis keys > plan nb screens) 
     send { authorized: false }
   else
     send { authorized: true, screens: [ ] }
```

## GET /auth/screens/

additionnal infos

```json
[
   { "uuid": "a4223fbc8d", "ip": "192.168.0.1", "ua": "Edge" },
   { "uuid": "a4fdbb92d", "ip": "192.168.42.1", "ua": "Android" },
   { "uuid": "dd223bca8d", "ip": "192.42.42.1", "ua": "Philips" }
]
```

# Redis

```
user.{userId}.screens.{uuid} => '{"ua":"webkit","ip":"192.168.2.1","now":"2015-11-23..."}'
```

# Cookies

name: screens
domain: .afrostream.tv
data: base64(JSON.stringify({uuid:string,userId:string,plan:string,expiration:int,key:string))

# Weakness

this lock by screen functionnality is very weak.
a user can change auth-screens.afrostream.tv domain or use a proxy to answer { authorized : true }

# Limitation, O(n²)

on every hit, we perform "checkAuth", doing redis.keys()
This redis call is a O(n) complexity

But,
Nb keys = Nb users watching in real time x avg screns
Nb searchs by sec = Nb users watching in real time / player pooling ttl
=> complexity is ~= O(n²)/ttl with n the number of users watching in real time.

redis can perform a 1 Million search in 40ms on default laptop.
let say that avg screens = 2 & ttl = 10.

## 100 concurrent users

Nb keys = 200
Nb searchs by sec = 10

rows searched by sec ~= 2 000   <=> 0ms cpu

## 1 000 concurrent users

Nb keys = 2 000
Nb searchs by sec = 100

rows searched by sec ~= 200 000  <=> 8ms cpu

## 10 000 concurrent users
 
Nb keys = 20 000
Nb searchs by sec = 1 000

rows searched by sec ~= 20 000 000 <=> 800ms cpu

## Solution

When reaching 10 000 concurrent users, we will need to change redis algorithm.
Ex: add a meta hkey user.{userId}.screens containing list of "screen-uuid, with content & timeout" 
    (manually handle the timeout)
Or reference other expiring redis keys.