var
  wrb= require("."),
  go= require("global-object")

function install(){
	var i= new wrb();
	go.webpackRequire= i.require.bind( i)
	go.webpackRequire.require= i.require.bind( i)
	go.webpackRequire.setRecords= i.setRecords.bind( i)
	go.webpackRequire.setRecordsUrl= i.setRecordsUrl.bind( i)
};
install()

