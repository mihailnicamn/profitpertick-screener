let tableBody = $('#tableBody');

function getData(pairList) {
    //get all pair prices from binance api
    $.ajax({
        url: 'https://api.binance.com/api/v1/ticker/24hr',
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            console.log(data);
            parse(data, pairList)
        }
    });

}
function getSymbols(symbols) {
    let endpoint = 'https://api.binance.com/api/v3/exchangeInfo';
    $.ajax({
        url: endpoint,
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            let psymbols = [];
            data.symbols.forEach(function(symbol) {
                symbols.forEach(function(pair) {
                    if (symbol.symbol.toString().toUpperCase() === pair.toString().toUpperCase()) {
                        psymbols.push(symbol);
                    }
                });
            });
            let bsymbols = [];
            psymbols.forEach(function(symbol) {
                let mintick = symbol.filters[0].tickSize;
                bsymbols.push({
                    symbol: symbol.symbol,
                    minTick: parseFloat(mintick)
                });
            });
            localStorage.setItem('symbols_minticks', JSON.stringify(bsymbols));
        }

    });
}

/* Global var for counter */
var giCount = 1;

$(document).ready(function() {

    $("#pairList").hide();
	$('#example').dataTable();
} );

function fnClickAddRow(tableData) {
    $('#example').dataTable().fnClearTable();
    tableData.forEach(function(pair) {
	$('#example').dataTable().fnAddData( [
        pair.symbol,
        pair.price,
        pair.p_vol,
        pair.Dvolatility,
        pair.change,
        pair.min_tick,
        pair.bppop,
    ] );
}
);
}
setInterval(function() {
    $("#pairList").val(decodeURIComponent(getUrlParameter("pairs")))
    pairListRaw = $('#pairList').val();
    pairList = pairListRaw.split(';');
    console.log(pairList);
    getData(pairList);
}, 5000);

function cleanFloat(num) {
    let sides = num.toString().split('.');
    let left = sides[0];
    let right = sides[1];
    right.replaceAll('0', '');
    let newNum = left + '.' + right;
    return newNum;
}

function parse(data, pairList) {
    getSymbols(pairList);
    let html = "";
    let tabledata = [];
    data.forEach(function(pair) {
        pairList.forEach(function(pairName) {
            if (pair.symbol == pairName.toUpperCase()) {
                let min_tick = JSON.parse(localStorage.getItem('symbols_minticks')).find(function(symbol) {
                    return symbol.symbol == pair.symbol;
                }).minTick;
                console.log("------------------", min_tick);
                let symbol = pair.symbol;
                let price = pair.lastPrice;
                let volume = pair.volume;
                let p_vol = pair.highPrice-pair.lowPrice;
                let vol = volume;
                let bppop = ((1/parseFloat(price))*parseFloat(min_tick)*100)+"%"
                let ppbp = (parseFloat(price) - parseFloat(min_tick)) / parseFloat(min_tick);
                let volpppbp = parseFloat(volume) / parseFloat(ppbp);
                let pp_vol =  parseFloat(volume)/parseFloat(price) ;
                let pp_volpppbp = parseFloat(pp_vol)/parseFloat(ppbp);
                let Dpvolatility = parseFloat(p_vol)/parseFloat(min_tick);
                let Dvolatility = parseFloat(Dpvolatility) * parseFloat(bppop);
                let change = pair.priceChangePercent;

                console.log("high: "+pair.highPrice+"\nlow: "+pair.lowPrice+"\np_vol: "+p_vol, "\nmin_tick: "+min_tick, "\nDpvolatility: "+Dpvolatility);
                html += '<tr><td>' + symbol + '</td><td>' + parseFloat(price) + '</td><td>' + parseFloat(min_tick) + '</td><td>'+parseFloat(bppop)+'</td></tr>';
                tabledata.push({ "symbol": symbol, "price": parseFloat(price),"p_vol":parseInt(Dpvolatility),"Dvolatility":parseFloat(Dvolatility)+"%","change":parseFloat(change)+"%", "min_tick": parseFloat(min_tick), "ppbp": parseInt(ppbp), "volume": parseFloat(vol), "volpppbp": parseFloat(volpppbp).toFixed(2), "pp_vol": parseFloat(pp_vol).toFixed(2), "pp_volpppbp": parseFloat(pp_volpppbp).toFixed(2) , "bppop": bppop});
                console.log(ppbp)
            }
        });
    });

    //populateDataTable(tabledata);
    fnClickAddRow(tabledata)
};



function render(data) {



}

$(document).ready(function() {
    $("#example").DataTable();
});

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
    return false;
};



;