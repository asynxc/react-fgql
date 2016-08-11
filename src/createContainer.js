import React from 'react'
import {QueryObject, EndPoint} from 'fgql'

var isPlainObject = require('lodash/isPlainObject')
var mapValues = require('lodash/mapValues')
var forEach = require('lodash/forEach')
var some = require('lodash/some')
var invariant = require('invariant')

export default function createContainer (Queries, Component, endPoint) {
	invariant(Component,
	'a Component must be assigned to the container!')

	invariant(endPoint === void 0 || endPoint instanceof EndPoint,
	'endPoint seems to be not a valid EndPoint instance!')

	invariant(isPlainObject(Queries),
	`expected "Query" parameter type to be a plain object, instead got ${typeof Queries}!`)

	const TdisplayName = Component.displayName || Component.name || 'Component'
	const HdisplayName = `React-fgql(${TdisplayName})`

	class HoCompoenent extends React.Component {
		constructor (props, context) {
			super(props, context)
			this.state = {}

			this.stopAutoFetch = this.stopAutoFetch.bind(this)
			this.autoFetch = this.autoFetch.bind(this)
			this.isFetching = this.isFetching.bind(this)

			this.QueryObejcts = mapValues(Queries,
				(_q) =>	new QueryObject(
					{
						...{endPoint: endPoint},
						..._q,
						...{defaultVars: typeof _q.defaultVars === FUNCTION ? _q.defaultVars({...this.props}) : _q.defaultVars},
						...{autoFetch: typeof _q.autoFetch === FUNCTION ? _q.autoFetch({...this.props}) : _q.autoFetch},
						...{fetchInterval: typeof _q.fetchInterval === FUNCTION ? () => _q.fetchInterval({...this.props}) : _q.fetchInterval}
					},
					typeof _q.mapDataToProps === FUNCTION
					? (data) => this.setState(data ? {..._q.mapDataToProps(data)} : {})
					: _q.mapDataToProps
				)
			)

			this._fgql = {
				...this.QueryObejcts,
				stopAutoFetch: this.stopAutoFetch,
				autoFetch: this.autoFetch,
				isFetching: this.isFetching
			}
		}

		stopAutoFetch () {
			forEach(this.QueryObejcts,
				(_q) => { _q._fetchInterval && _q.stopAutoFetch() })
		}

		autoFetch () {
			forEach(this.QueryObejcts,
				(_q) => { _q._fetchInterval() && _q.autoFetch(() => ({...this.props}))() })
		}

		isFetching () {
			return some(this.QueryObejcts, _q => _q.isFetching())
		}

		componentDidMount () {
			forEach(this.QueryObejcts,
				(_q) => { _q._autoFetch && !_q._fetchInterval() && _q.fetch({...this.props}) })
			this.autoFetch()
		}

		componentWillUnmount () {
			this.stopAutoFetch()
		}

		render () {
			return Component.prototype.isReactComponent
			? <Component {...this.props} {...this.state} fgql={this._fgql} />
			: Component({...this.props}, {...this._fgql}, {...this.state})
		}
	}

	HoCompoenent.displayName = HdisplayName

	return HoCompoenent
}
