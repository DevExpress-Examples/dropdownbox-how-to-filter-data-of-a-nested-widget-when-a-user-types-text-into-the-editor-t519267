window.onload = function() {
    var searchTimer;
    
    var dataSource = new DevExpress.data.DataSource({
        searchExpr: ["CompanyName", "City", "Phone"],
        store: new DevExpress.data.CustomStore({
            loadMode: "raw",
            key: "ID",
            load: function() {
                return $.getJSON("data/customers.json");
            }
        })
    });
    
    var gridBoxValue = ko.observable(11),
        gridBoxText = ko.observable(),
        gridBoxDisplayValue = ko.observable(),
        gridBoxOpened = ko.observable(false);
    
    gridBoxValue.subscribe(function () {
        gridBoxOpened(false);
    });
    
    var isSearchIncomplete = ko.computed(function(){
        var text = gridBoxText(),
            displayValue = gridBoxDisplayValue();
        
        text = text && text.length && text[0];
        displayValue = displayValue && displayValue.length && displayValue[0];
    
        return text !== displayValue;
    });
    
    var gridBoxOptions = {
        value: gridBoxValue,
        text: gridBoxText,
        displayValue: gridBoxDisplayValue,
        valueExpr: "ID",
        placeholder: "Select a value...",
        displayExpr: "CompanyName",
        showClearButton: true,
        acceptCustomValue: true,
        openOnFieldClick: false,
        valueChangeEvent: "",
        opened: gridBoxOpened,
        dataSource: dataSource,
        onInput: function(){
            clearTimeout(searchTimer);
            searchTimer = setTimeout(function() {
                dataSource.searchValue(gridBoxText());
                if (gridBoxOpened() && isSearchIncomplete()) {
                    dataSource.load();
                } else {
                    gridBoxOpened(true);
                }
            }, 1000);
        },
        onOpened: function(){
            if (isSearchIncomplete()){
                dataSource.load();
            }
        },
        onClosed: function(e){
            var value = gridBoxValue(),
                searchValue = dataSource.searchValue();
        
            if (isSearchIncomplete()){
                e.component.reset();
                gridBoxValue(value);
            }
        
            if (searchValue) {
                dataSource.searchValue(null);
                dataSource.load();
            }
        },
        dataGrid: {
            dataSource: dataSource,
            columns: ["CompanyName", "City", "Phone"],
            hoverStateEnabled: true,
            paging: { enabled: true, pageSize: 10 },
            scrolling: { mode: "infinite" },
            height: 265,
            selection: { mode: "single" },
            selectedRowKeys: ko.computed(function(){
                var editorValue = gridBoxValue();
                return (editorValue && [editorValue]) || [];
            }),
            onSelectionChanged: function(selectedItems){
                var hasSelection = selectedItems.selectedRowKeys.length;
                gridBoxValue(hasSelection ? selectedItems.selectedRowKeys[0] : null);
            }
        }
    };
    
    var viewModel = {
        gridBoxOptions: gridBoxOptions
    };
    
    ko.applyBindings(viewModel, document.getElementById("dropdown-box-demo"));
};