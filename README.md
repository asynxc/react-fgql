# react-fgql

react-fgql is a [HoC][https://medium.com/@franleplant/react-higher-order-components-in-depth-cf9032ee6c3e#.9tw4hybaz] for integration [fgql][https://github.com/hamavb/fgql] into react application

react-fgql is umd (Universal Module Definition) library.

## Installation

`npm install --save react-fgql fgql`

## Dependencies

react-fgql depend on [fgql][https://github.com/hamavb/fgql] to interact with single or multiple graphql endpoint.
So you have to install `fgql` module.

`npm install --save fgql`

## API :

react-fgql take care of instantiating [fgql][https://github.com/hamavb/fgql] and manage single or multiple queries for the warped component.
it allow you to declaratively define multiple queries and related data processing. Then deliver required data and states as props.


react-fgl expose one class `createContainer`.

### `QueryObject`

`QueryObject` is a class of [fgql][https://github.com/hamavb/fgql] module.
a couple options `autoFetch` and `mapDataToProps` are added to `QueryObject` that are **react-fgql** specifics.
also regular `fetchInterval` parameter can be a function that return a number.
if `fetchInterval` value is greater then 0, **react-fgql** starts fetching immediatly and sequentially each X ms when HoC is mounted. 


```js
// ...
var Queries = {
  getUsers: {
    //...
    // autoFetch: false // default
    autoFetch: (ownerProps) => ownerProps.autoFetch,
    mapDataToProps: (data) => ({
        Users: data.Users,
        UsersCount: data.Users.length
    }),
    // fetchInterval: 0 // default
    fetchInterval: (ownerProps) => ownerProps.pullInterval
  }
}

// ...
```

### `createContainer`

for a `EditUser` Component, basicly you would need a target `User` object and a `updateUser` function to submit changes to the server.
`createContainer` can declaratively provide required actions handler to easly fetch and/or submit data.


Parameters Table :

| Parameter     	| Type 									                                                      | Default value         |
| :-------------- | :-------------------------------------------------------------------------- | :-------------------  |
| Queries		      | plainObject					                                                        |  undefined            |
| Component				| object | function(ownerProps: object, fgql: object, mapDataToProps: object) |  undefined					  |
| endPoint		    | ?instanceof EndPoint	                                                      |  undefined            |


`Queries` is a plain object. each key is a `QueryObject` type of [fgql][https://github.com/hamavb/fgql] modules.

`Component` is the target component. can be either a React Component or a function that return a React Component.

`endPoint` is a regular `EndPoint` instance of [fgql][https://github.com/hamavb/fgql] modules. 
each `QueryObject` can have an endPoint parameter, if none is provided, this one is used.


```js
import React from 'react'
import {EndPoint} from 'fgql'
import {createContainer} from 'react-fgql'

var endPoint = new EndPoint(/* ... */)
var EditUser = class EditUser extends React.Component {/* ... */}

var Queries = {
	getUser: {
		query: ({id}) =>
			`query {
				Viewer {
					User(id: ${id}) {
						id
						fullname 
						email
					}
				}
			}`,
		processResult: (data) => data.Viewer.User,
		// mapDataToProps processed fetch result to props of target component
		mapDataToProps: (data) => ({User: data}),
		// only fire a fetch of 'User' if owner component did not provide it as Props.
		// that's very helpful if component loaded from different places (routes)
		// where some routes provide `User` and others only provide `id`.
		autoFetch: (ownerProps) => !(ownerProps && ownerProps.User)
	},
	updateUser: {
		query: ({id, fullname, email}) =>
			`mutation {
				UpdateUser(
					User: {id: ${id}, fullname: "${fullname}", email: "${email}"}
				) {
					id
					fullname
					email
				}
			}`,
		mapDataToProps: (data) => ({User: data.UpdateUser})
	}
}



var HoC = createContainer(Queries, (ownerProps, fgql, mapDataToProps) => {
  // if `User` object is available (either provided by owner component or auto-fetched) render `EditUser`.
	if (ownerProps && ownerProps.User || mapDataToProps && mapDataToProps.User) {
		return <EditUser {...ownerProps} {...mapDataToProps} fgql={fgql} />
	} else {
    // otherwise, render `Loading` component till the auto-fetch is completed.
		return <label> Loading... </label>
	}
}, endPonit)

// ...
```

Props Table :

`<TargetComponent ...{ownerProps} ...{mapDataToProps} fgql={fgql} />`


| Property     		| Type                  |
| :----------- 		| :-------------------  |
| ownerProps			| object                |
| mapDataToProps	| object                |
| fgql			      | object                |

`ownerProps` is the owner Props passed along by **react-fgql**.

`mapDataToProps` is the result of **mapDataToProps** function.

`fgql` is a collection of `QueryObject`s and couple of helper functions such `stopAutoFetch`, `autoFetch` and `isFetching`.

  * `stopAutoFetch()` is for stoping all running auto-fetch QueryObject.

  * `autoFetch()` is for starting auto-fetch manually (rather than do it declaratively by setting `fetchInterval`).

  * `isFetching()`, return `true` if any QueryObject is fetching, otherwise `false`.

## Features development

...

## Test

`npm run test`

## Contributing

```
git clone https://github.com/hamavb/react-fgql.git
cd react-fgql
npm install
```

Criticize or pull requests are very welcome.
