let tableBody = $('#tableBody');

function getData(pairList) {
    //get all pair prices from binance api
    $.ajax({
        url: 'https://api.binance.com/api/v1/ticker/24hr',
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            console.log(data);
            render(data, pairList)
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
        pair.Dvolatility,
        pair.stringofDigits,
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

function render(data, pairList) {
    let html = "";
    let tabledata = [];
    data.forEach(function(pair) {
        pairList.forEach(function(pairName) {
            if (pair.symbol == pairName.toUpperCase()) {
                let stringofDigits = '';
                let symbol = pair.symbol;
                let price = pair.lastPrice;
                let volume = pair.volume;
                let Dvolatility = pair.priceChangePercent;
                if(Dvolatility < 0){
                    Dvolatility*= -1;
                }
                let vol = volume;
                let leftright = parseFloat(price).toString().split('.');
                if (parseFloat(price).toString().includes('.')) {

                    let left = leftright[0];
                    let right = leftright[1];
                    let digitNo = 0;
                    if (right.length == null) {} else {
                        digitNo = right.length;
                    }
                    stringofDigits += '0.';
                    for (let i = 0; i < digitNo - 1; i++) {
                        stringofDigits += '0';
                    }

                }
                stringofDigits += '1';
                let bppop = ((1/parseFloat(price))*parseFloat(stringofDigits)*100).toFixed(3)+"%"
                let ppbp = (parseFloat(price) - parseFloat(stringofDigits)) / parseFloat(stringofDigits);
                let volpppbp = parseFloat(volume) / ppbp;
                let ppvol =  parseFloat(volume)/parseFloat(price) ;
                let ppvolpppbp = ppvol/ppbp;
                html += '<tr><td>' + symbol + '</td><td>' + parseFloat(price) + '</td><td>' + parseFloat(stringofDigits) + '</td><td>'+parseFloat(bppop)+'</td></tr>';
                tabledata.push({ "symbol": symbol, "price": parseFloat(price),"Dvolatility":parseFloat( Dvolatility)+"%", "stringofDigits": parseFloat(stringofDigits), "ppbp": parseInt(ppbp), "volume": parseFloat(vol), "volpppbp": parseFloat(volpppbp).toFixed(2), "ppvol": parseFloat(ppvol).toFixed(2), "ppvolpppbp": parseFloat(ppvolpppbp).toFixed(2) , "bppop": bppop});
                console.log(ppbp)
            }
        });
    });

    //populateDataTable(tabledata);
    fnClickAddRow(tabledata)
};



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