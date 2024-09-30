#!/bin/bash

rm -rf ./api/api.ts && rm -rf ./api/model && openapi-generator-cli generate -o ./api -i https://surge-mobility-api-dev.azurewebsites.net/swagger/v1/swagger.json -g typescript-angular --additional-properties useEnumExtension=true,modelPropertyNaming=original,enumValueNaming=UPPERCASE
