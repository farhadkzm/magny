let mapApp = angular.module('mapApp', ['ngMaterial', 'ngMessages']);


mapApp.controller('DynController', [
    '$scope', '$http', '$interpolate', '$mdSidenav', '$mdDialog', '$mdMedia',
    function ($scope, $http, $interpolate, $mdSidenav, $mdDialog, $mdMedia) {
        let self = this;

        self.$onInit = function () {

            $scope.type = 'doctor';
            $scope.dynamodb = new AWS.DynamoDB();
            $scope.docClient = new AWS.DynamoDB.DocumentClient();

            $scope.startYear = 2014;
            $scope.endYear = 2017

        };

        $scope.toggleSideBar = function () {
            $mdSidenav('searchSide').toggle();
        };

        $scope.closeSearchSide = function () {
            $mdSidenav('searchSide').close();
        };

        $scope.showSearchTab = function () {
            $scope.selectedSideTabIndex = 0;
            $scope.toggleSideBar();
        };

        $scope.searchServices = function () {

            console.log($scope.location3);
        };


        $scope.createTable = function () {
            var params = {
                TableName: "Movies",
                KeySchema: [
                    {AttributeName: "year", KeyType: "HASH"},
                    {AttributeName: "title", KeyType: "RANGE"}
                ],
                AttributeDefinitions: [
                    {AttributeName: "year", AttributeType: "N"},
                    {AttributeName: "title", AttributeType: "S"}
                ],
                ProvisionedThroughput: {
                    ReadCapacityUnits: 5,
                    WriteCapacityUnits: 5
                }
            };

            $scope.dynamodb.createTable(params, function (err, data) {
                if (err) {
                    $scope.operationLogs += "Unable to create table: " + "\n" + JSON.stringify(err, undefined, 2);
                } else {
                    $scope.operationLogs += "Created table: " + "\n" + JSON.stringify(data, undefined, 2);
                    for (var i = 0; i < 50; i++) {
                        $scope.createItem(2015, i, "Movie number " + i)

                    }

                }


            });
        };

        $scope.deleteTable = function () {
            var params = {
                TableName: "Movies"
            };

            $scope.dynamodb.deleteTable(params, function (err, data) {
                if (err) {
                    $scope.operationLogs += "Unable to delete table: " + "\n" + JSON.stringify(err, undefined, 2);
                } else {
                    $scope.operationLogs += "Table deleted.";

                }
            });
        };

        $scope.listMovies = function () {
            var params = {};
            $scope.dynamodb.listTables(params, function (err, data) {
                if (err) {
                    $scope.operationLogs += "Unable to list tables: " + "\n" + JSON.stringify(err, undefined, 2);
                }
                else {
                    $scope.operationLogs += "List of tables: " + "\n" + JSON.stringify(data, undefined, 2);
                }
            });
        }

        $scope.createItem = function (year, rating, text) {
            var params = {
                TableName: "Movies",
                Item: {
                    "year": year,
                    "title": text,
                    "info": {
                        "plot": "Nothing happens at all.",
                        "rating": rating
                    }
                }
            };
            $scope.docClient.put(params, function (err, data) {
                if (err) {
                    $scope.operationLogs += "Unable to add item: " + "\n" + JSON.stringify(err, undefined, 2);
                } else {
                    $scope.operationLogs += "PutItem succeeded: " + "\n" + JSON.stringify(data, undefined, 2);
                }
            });
        }

        $scope.readItem = function () {
            var table = "Movies";
            var year = 2015;
            var title = "The Big New Movie";

            var params = {
                TableName: table,
                Key: {
                    "year": year,
                    "title": title
                }
            };
            $scope.docClient.get(params, function (err, data) {
                if (err) {
                    $scope.operationLogs += "Unable to read item: " + "\n" + JSON.stringify(err, undefined, 2);
                } else {
                    $scope.operationLogs += "GetItem succeeded: " + "\n" + JSON.stringify(data, undefined, 2);
                }
            });
        }

        $scope.updateItem = function () {
            var table = "Movies";
            var year = 2015;
            var title = "The Big New Movie";

            var params = {
                TableName: table,
                Key: {
                    "year": year,
                    "title": title
                },
                UpdateExpression: "set info.rating = :r, info.plot=:p, info.actors=:a",
                ExpressionAttributeValues: {
                    ":r": 5.5,
                    ":p": "Everything happens all at once.",
                    ":a": ["Larry", "Moe", "Curly"]
                },
                ReturnValues: "UPDATED_NEW"
            };

            $scope.docClient.update(params, function (err, data) {
                if (err) {
                    $scope.operationLogs += "Unable to update item: " + "\n" + JSON.stringify(err, undefined, 2);
                } else {
                    $scope.operationLogs += "UpdateItem succeeded: " + "\n" + JSON.stringify(data, undefined, 2);
                }
            });
        }

        $scope.deleteItem = function () {
            var table = "Movies";
            var year = 2015;
            var title = "The Big New Movie";

            var params = {
                TableName: table,
                Key: {
                    "year": year,
                    "title": title
                }
            };
            $scope.docClient.delete(params, function (err, data) {
                if (err) {
                    $scope.operationLogs += "Unable to delete item: " + "\n" + JSON.stringify(err, undefined, 2);
                } else {
                    $scope.operationLogs += "DeleteItem succeeded: " + "\n" + JSON.stringify(data, undefined, 2);
                }
            });
        }

        $scope.queryMovies = function () {
            $scope.operationLogs += "";
            $scope.operationLogs += "Querying for movies from 1985.";

            var params = {
                TableName: "Movies",
                KeyConditionExpression: "#yr = :yyyy",
                ExpressionAttributeNames: {
                    "#yr": "year"
                },
                ExpressionAttributeValues: {
                    ":yyyy": 1985
                }
            };

            $scope.docClient.query(params, function (err, data) {
                if (err) {
                    $scope.operationLogs += "Unable to query. Error: " + "\n" + JSON.stringify(err, undefined, 2);
                } else {
                    data.Items.forEach(function (movie) {
                        $scope.operationLogs += "\n" + movie.year + ": " + movie.title;
                    });

                }
            });


        }

        $scope.scanMovies = function () {
            $scope.movies = [];
            $scope.operationLogs += "";
            $scope.operationLogs += "Scanning for movies between 1950 and 1975." + "\n";

            var params = {
                TableName: "Movies",
                ProjectionExpression: "#yr, title, info.rating",
                FilterExpression: "#yr between :start_yr and :end_yr",
                ExpressionAttributeNames: {
                    "#yr": "year"
                },
                ExpressionAttributeValues: {
                    ":start_yr": $scope.startYear,
                    ":end_yr": $scope.endYear
                }
            };

            $scope.docClient.scan(params, onScan);

            function onScan(err, data) {
                if (err) {
                    $scope.operationLogs += "Unable to scan the table: " + "\n" + JSON.stringify(err, undefined, 2);
                } else {
                    // Print all the movies
                    $scope.operationLogs += "Scan succeeded: " + "\n";

                    data.Items.forEach(function (movie) {
                        $scope.movies.push(moive);
                        $scope.operationLogs += movie.year + ": " + movie.title + " - rating: " + movie.info.rating + "\n";
                    });

                    // Continue scanning if we have more movies (per scan 1MB limitation)
                    $scope.operationLogs += "Scanning for more..." + "\n";
                    params.ExclusiveStartKey = data.LastEvaluatedKey;
                    $scope.docClient.scan(params, onScan);
                }
            }
        }

    }
]);
