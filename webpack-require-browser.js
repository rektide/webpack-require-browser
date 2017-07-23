function validate2xx(res){
	if( res.status< 200|| res.status> 299){
		var err= new Error("Unexpected response code")
		err.status= res.status
		throw err
	}
	return res
}
function toJson(res){
	return res.json()
}

class WebpackRequireBrowser{
	constructor( records){
		this.setRecords( records)
	}
	setRecords( records){
		this.records= null
		if( !records){
		}else if( typeof records=== "string"){
			try{
				this.setRecords( JSON.parse( records))
			}catch(ex){
				this.setRecordsUrl( records)
			}
		}else{
			this.records= records
		}
	}
	setRecordsUrl( url){
		this.fetch= fetch( url)
			.then(validate2xx)
			.then(toJson)
			.then(json=> this.setRecords(json))
	}

	require( ...needs){
		// Must have all "needs" in sequence
		function hasNeeds(m){
			var pos= 0;
			for( var i= 0; i< needs.length; ++i){
				pos= m.indexOf( needs[i], pos)
				if( pos== -1){
					return false
				}
			}
			return true
		}

		// If NamedModulesPlugin is present, we can just scan webpack directly
		var
		  webpackKeys= Object.keys(__webpack_require__.c),
		  webpackIds= webpackKeys.filter( hasNeeds)
		if( webpackIds.length> 1){
			var err= Error( "Multiple modules found"+ webpackIds.join(","))
			err.modules= webpackIds
			throw err
		}else if( webpackIds.length=== 1){
			return __webpack_require__( webpackIds[ 0])
		}

		// Start scanning the records
		var recordIds= Object.keys( this.records.modules.byIdentifier).filter( hasNeeds)
		if( recordIds.length> 1){
			var err= Error( "Multiple modules found: "+ recordIds.join(","))
			err.modules= recordIds
			throw err
		}
		if( recordIds.length== 0){
			return
		}
		var
		  id= this.records.modules.byIdentifier[ recordIds[ 0]],
		  module= __webpack_require__.c[ id]
		if( !module){
			// NamedModulesPlugin or HashedModuleIdsPlugin will mangle the ids. Key order thankfully still corresponds.
			id= webpackKeys[ recordIds[ 0]+ 2]
			module= __webpack_require__.c[ id]
		}
		console.log("module", module.__esModule, module.exports, module)
		return __webpack_require__( id)
	}
}

module.exports= WebpackRequireBrowser
