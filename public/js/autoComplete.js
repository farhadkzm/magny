function initAddressAutoComplete() {

    enableAutComplete('address-auto-search');

}

function enableAutComplete(id) {
    let input = document.getElementById(id);

    let autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.setTypes(['address']);
    autocomplete.addListener('place_changed', function () {
        let place = autocomplete.getPlace();

        var scope = angular.element(input).scope();
        scope.$apply(function () {
            scope.place = {
                address: place.formatted_address,
                location: [place.geometry.location.lat(), place.geometry.location.lng()]
            };
        });

    });

}