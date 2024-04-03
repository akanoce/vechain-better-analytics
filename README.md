# vechain-better-events

## Contents

This repo contains a series of scripts useful in order to aggregate and gather analytics from events emitted from the b3tr contracts.

This is what the scripts support at the moment

- Generate a XLSX file containining different sheets:
  - An overview with all the unique users and the total votes casted in every round;
  - A sheet for every round with the details of the vote cast by the user;
- Get the B3TR transfers from or to specific addresses;
- Get the formatted votes of all or specific users for one or more rounds;

## Usage

### Install the required packages

`yarn install`

Require to have yarn installed globally

If yarn is not installed, follow [this](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable)

### Run the scripts

#### Generate insights XLSX

`yarn start --insights`

Will produce a file `vebetterdao_insights.xlsx` in the same folder

#### B3TR transfers

##### Get all transfers

` yarn start --transfers`

##### Get all transfers from a specific address

` yarn start --transfers -f <address>`

##### Get all transfers to a specific address

` yarn start --transfers -t <address>`

##### Get all transfers from and to a specific address

` yarn start --transfers -f <address_1> -t <address_2>`

#### Allocations votes

##### All votes of a specific user

`yarn start --votes -v <address>`

##### All votes of all rounds

`yarn start --votes`

##### All votes of a specific round

`yarn start --votes -r 1`

##### All votes of a specific round from a specific user

`yarn start --votes -r <round_number> -v <address>`
