# New core
UI builder for JSON data

## JSON configuration
JSON recursively has the following structure
```
{
    "type": <string>,
    "props": {},
    "nodes": Array<Component>,
    "chunk": <string>
}
```
* "type" can contains core component name (Button, Label) or HTML tag name (div, span)

* "props" object with any props that will be passed to component

* "nodes" - array of child components

* "chunk" - if components should be lazy loaded, split them to separate chunk and put address to "chunk" prop. "components" will be overrided after chuck loaded. 
To use loader you can put loader component in components along with chuck.
```
{
    "name": "Route",
    "props": {
        "to": "/main"
    },
    "components": [
        {
            "name":"Loader"
        }
    ],
    "chunk": "/main.json
}
```

## Connecting props to data storage
To use connection pass object of shape to prop
```
{
    "$type": "$data",
    "path": "$store.apis.custodian.client"
}
```

with paramas

```
{
    "$type": "$data",
    "path": "$store.apis.custodian.client.getByPk[{\"$type\":\"$data\", \"path\":\"$route.params.id\"}]"
}
```

available $data storage
* $store - restify
* $auth - authorization methods
* $route: { history, params, location, searchParams } - react router data
* $context - any data passed to context. List item in list, for example
* $page - page entites data such modals
* $global: { window, moment } - window object & moment.js object

## Using expression
```
{
    "$type": "$expression",
    "expression": "data(\"$route.location.pathname\") == \"/clients\" ? \"Clients*\" : \"Clients\"" 
}
```
To evaluate expression [expr-eval](https://www.npmjs.com/package/expr-eval) is used
To get value from the data layer wrap path into data()

## Using actions
```
{
    "$type": "$action",
    "path": "$page.closeModal",
    "args": ["modal"]
}
```