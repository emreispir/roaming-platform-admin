#!/bin/bash

rm -rf ./api/api.ts && rm -rf ./api/model && openapi-generator-cli generate -o ./api -i ~/Desktop/swagger.json -g typescript-angular --additional-properties useEnumExtension=true,modelPropertyNaming=original,enumValueNaming=UPPERCASE
