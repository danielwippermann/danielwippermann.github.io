define({ api: [
  {
    "type": "get",
    "url": "/dlx/download/download",
    "title": "Download data",
    "name": "DownloadDownload",
    "group": "Download",
    "parameter": {
      "fields": {
        "Query Parameters": [
          {
            "group": "query",
            "type": "String",
            "field": "sessionAuthUsername",
            "optional": true,
            "description": "User name for web interface access."
          },
          {
            "group": "query",
            "type": "String",
            "field": "sessionAuthPassword",
            "optional": true,
            "description": "Password for web interface access."
          },
          {
            "group": "query",
            "type": "String",
            "field": "source",
            "defaultValue": "log",
            "optional": true,
            "description": "Optional data source (`log` = recorded data, `current` = live data)."
          },
          {
            "group": "query",
            "type": "String",
            "field": "inputType",
            "defaultValue": "packets",
            "optional": true,
            "description": "Optional input data type (`packets` = VBus v1 data)."
          },
          {
            "group": "query",
            "type": "String",
            "field": "outputType",
            "defaultValue": "text-tab-crlf",
            "optional": true,
            "description": "Optional output type (see below for details)."
          },
          {
            "group": "query",
            "type": "Number",
            "field": "sieveInterval",
            "defaultValue": "1",
            "optional": true,
            "description": "Optional sieve interval. Allows filtering the data to be downloaded by specifying an interval in seconds that should be kept between two data records. For example: the DL2 could be configured to store data every 10 seconds, but you can download a file only containing hourly records by specifying „3600“ here."
          },
          {
            "group": "query",
            "type": "Number",
            "field": "ttl",
            "defaultValue": "0",
            "optional": true,
            "description": "Optional time-to-live in seconds."
          },
          {
            "group": "query",
            "type": "String",
            "field": "startDate",
            "optional": true,
            "description": "Optinoal start date (MM/DD/YYYY)."
          },
          {
            "group": "query",
            "type": "String",
            "field": "endDate",
            "optional": true,
            "description": "Optinoal end date (MM/DD/YYYY)."
          },
          {
            "group": "query",
            "type": "String",
            "field": "dataLanguage",
            "optional": true,
            "description": "Optional language code (ISO 639-1)."
          },
          {
            "group": "query",
            "type": "String",
            "field": "filter",
            "optional": true,
            "description": "Optional filter number (2 digits)."
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Example: Get all live data",
        "content": "   curl \"http://HOST/dlx/download/download?sessionAuthUsername=admin&sessionAuthPassword=admin&outputType=json&source=current\"\n"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "   HTTP/1.1 200 OK\n   Content-Type: application/json\n   \n   {\n       \"language\" : \"de\",\n       \"headers\" : [\n       {\n           \"id\" : \"00_0010_0053_0100\",\n           \"description\" : \"VBus 0: DL3\",\n           \"channel\" : 0,\n           \"destination_address\" : 16,\n           \"source_address\" : 83,\n           \"protocol_version\" : 16,\n           \"command\" : 256,\n           \"info\" : 0,\n           \"destination_name\" : \"DFA\",\n           \"source_name\" : \"DL3\",\n           \"fields\" : [\n           {\n               \"id\" : \"000_4_0\",\n               \"name\" : \"Resistor Sensor 1\",\n               \"unit\" : \" Ohm\",\n               \"unit_code\" : \"Ohms\"\n           },\n           {\n               \"id\" : \"004_4_0\",\n               \"name\" : \"Resistor Sensor 2\",\n               \"unit\" : \" Ohm\",\n               \"unit_code\" : \"Ohms\"\n           },\n           {\n               \"id\" : \"008_4_0\",\n               \"name\" : \"Resistor Sensor 3\",\n               \"unit\" : \" Ohm\",\n               \"unit_code\" : \"Ohms\"\n           },\n           {\n               \"id\" : \"012_4_0\",\n               \"name\" : \"Current Sensor 4\",\n               \"unit\" : \" mA\",\n               \"unit_code\" : \"Milliamperes\"\n           },\n           {\n               \"id\" : \"034_2_0\",\n               \"name\" : \"Temperature Sensor 1\",\n               \"unit\" : \" \\u00B0C\",\n               \"unit_code\" : \"DegreesCelsius\"\n           },\n           {\n               \"id\" : \"036_2_0\",\n               \"name\" : \"Temperature Sensor 2\",\n               \"unit\" : \" \\u00B0C\",\n               \"unit_code\" : \"DegreesCelsius\"\n           },\n           {\n               \"id\" : \"038_2_0\",\n               \"name\" : \"Temperature Sensor 3\",\n               \"unit\" : \" \\u00B0C\",\n               \"unit_code\" : \"DegreesCelsius\"\n           }\n           ]\n       }\n       ],\n       \"headerset_stats\" : {\n           \"headerset_count\" : 1,\n           \"min_timestamp\" : 1385490534.720000,\n           \"max_timestamp\" : 1385490534.720000\n       },\n       \"headersets\" : [\n       {\n           \"timestamp\" : 1385490534.720000,\n           \"packets\" : [\n           {\n               \"header_index\" : 0,\n               \"timestamp\" : 1385490534.606000,\n               \"field_values\" : [\n               {\n                   \"field_index\" : 0,\n                   \"raw_value\" : 994.973000,\n                   \"value\" : \"994.973\"\n               },\n               {\n                   \"field_index\" : 1,\n                   \"raw_value\" : 1072.768000,\n                   \"value\" : \"1072.768\"\n               },\n               {\n                   \"field_index\" : 2,\n                   \"raw_value\" : 1078.975000,\n                   \"value\" : \"1078.975\"\n               },\n               {\n                   \"field_index\" : 3,\n                   \"raw_value\" : 3.990000,\n                   \"value\" : \"3.990\"\n               },\n               {\n                   \"field_index\" : 4,\n                   \"raw_value\" : -1.200000,\n                   \"value\" : \"-1.2\"\n               },\n               {\n                   \"field_index\" : 5,\n                   \"raw_value\" : 18.600000,\n                   \"value\" : \"18.6\"\n               },\n               {\n                   \"field_index\" : 6,\n                   \"raw_value\" : 20.200000,\n                   \"value\" : \"20.2\"\n               }\n               ]\n           }\n           ]\n       }\n       ]\n   }\n"
        }
      ]
    },
    "error": {
      "fields": {
        "500 Internal Server Errors": [
          {
            "group": "500",
            "field": "InvalidFilterID",
            "optional": false,
            "description": "The `filter` parameter could not be found."
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./dlx.js"
  },
  {
    "type": "get",
    "url": "/dlx/download/live",
    "title": "Get live data as JSON format",
    "name": "DownloadLive",
    "group": "Download",
    "parameter": {
      "fields": {
        "Query Parameters": [
          {
            "group": "query",
            "type": "String",
            "field": "sessionAuthUsername",
            "optional": true,
            "description": "User name for web interface access."
          },
          {
            "group": "query",
            "type": "String",
            "field": "sessionAuthPassword",
            "optional": true,
            "description": "Password for web interface access."
          },
          {
            "group": "query",
            "type": "String",
            "field": "channel",
            "optional": true,
            "description": "Optional channel number (2 digits)."
          },
          {
            "group": "query",
            "type": "String",
            "field": "filter",
            "optional": true,
            "description": "Optional filter number (2 digits)."
          },
          {
            "group": "query",
            "type": "String",
            "field": "view",
            "optional": true,
            "description": "Optional view number (2 digits)."
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Example: Get all live data",
        "content": "   curl \"http://HOST/dlx/download/live?sessionAuthUsername=admin&sessionAuthPassword=admin\"\n"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "   HTTP/1.1 200 OK\n   Content-Type: application/json\n   \n   {\n       \"language\" : \"de\",\n       \"headers\" : [\n       {\n           \"id\" : \"00_0010_0053_0100\",\n           \"description\" : \"VBus 0: DL3\",\n           \"channel\" : 0,\n           \"destination_address\" : 16,\n           \"source_address\" : 83,\n           \"protocol_version\" : 16,\n           \"command\" : 256,\n           \"info\" : 0,\n           \"destination_name\" : \"DFA\",\n           \"source_name\" : \"DL3\",\n           \"fields\" : [\n           {\n               \"id\" : \"000_4_0\",\n               \"name\" : \"Resistor Sensor 1\",\n               \"unit\" : \" Ohm\",\n               \"unit_code\" : \"Ohms\"\n           },\n           {\n               \"id\" : \"004_4_0\",\n               \"name\" : \"Resistor Sensor 2\",\n               \"unit\" : \" Ohm\",\n               \"unit_code\" : \"Ohms\"\n           },\n           {\n               \"id\" : \"008_4_0\",\n               \"name\" : \"Resistor Sensor 3\",\n               \"unit\" : \" Ohm\",\n               \"unit_code\" : \"Ohms\"\n           },\n           {\n               \"id\" : \"012_4_0\",\n               \"name\" : \"Current Sensor 4\",\n               \"unit\" : \" mA\",\n               \"unit_code\" : \"Milliamperes\"\n           },\n           {\n               \"id\" : \"034_2_0\",\n               \"name\" : \"Temperature Sensor 1\",\n               \"unit\" : \" \\u00B0C\",\n               \"unit_code\" : \"DegreesCelsius\"\n           },\n           {\n               \"id\" : \"036_2_0\",\n               \"name\" : \"Temperature Sensor 2\",\n               \"unit\" : \" \\u00B0C\",\n               \"unit_code\" : \"DegreesCelsius\"\n           },\n           {\n               \"id\" : \"038_2_0\",\n               \"name\" : \"Temperature Sensor 3\",\n               \"unit\" : \" \\u00B0C\",\n               \"unit_code\" : \"DegreesCelsius\"\n           }\n           ]\n       }\n       ],\n       \"headerset_stats\" : {\n           \"headerset_count\" : 1,\n           \"min_timestamp\" : 1385490534.720000,\n           \"max_timestamp\" : 1385490534.720000\n       },\n       \"headersets\" : [\n       {\n           \"timestamp\" : 1385490534.720000,\n           \"packets\" : [\n           {\n               \"header_index\" : 0,\n               \"timestamp\" : 1385490534.606000,\n               \"field_values\" : [\n               {\n                   \"field_index\" : 0,\n                   \"raw_value\" : 994.973000,\n                   \"value\" : \"994.973\"\n               },\n               {\n                   \"field_index\" : 1,\n                   \"raw_value\" : 1072.768000,\n                   \"value\" : \"1072.768\"\n               },\n               {\n                   \"field_index\" : 2,\n                   \"raw_value\" : 1078.975000,\n                   \"value\" : \"1078.975\"\n               },\n               {\n                   \"field_index\" : 3,\n                   \"raw_value\" : 3.990000,\n                   \"value\" : \"3.990\"\n               },\n               {\n                   \"field_index\" : 4,\n                   \"raw_value\" : -1.200000,\n                   \"value\" : \"-1.2\"\n               },\n               {\n                   \"field_index\" : 5,\n                   \"raw_value\" : 18.600000,\n                   \"value\" : \"18.6\"\n               },\n               {\n                   \"field_index\" : 6,\n                   \"raw_value\" : 20.200000,\n                   \"value\" : \"20.2\"\n               }\n               ]\n           }\n           ]\n       }\n       ]\n   }\n"
        }
      ]
    },
    "error": {
      "fields": {
        "500 Internal Server Errors": [
          {
            "group": "500",
            "field": "InvalidViewID",
            "optional": false,
            "description": "The `view` parameter was given but could not be found."
          },
          {
            "group": "500",
            "field": "InvalidFilterID",
            "optional": false,
            "description": "The `filter` parameter was given but could not be found."
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./dlx.js"
  }
] });