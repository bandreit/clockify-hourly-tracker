import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as SDK from "aws-sdk";
import { eventNames } from "process";
import { generateReport } from "./clockify-helper";

const endpoint = new awsx.apigateway.API("hour-tracker", {
    routes: [
        {
            path: "/report",
            method: "GET",
            eventHandler: async (event) => {

                if (!event.headers['x-api-key']) {
                    return {
                        headers: {
                            "Access-Control-Allow-Headers": "Content-Type, x-api-key",
                            "Access-Control-Allow-Origin": "*",
                            "Access-Control-Allow-Methods": "GET, OPTIONS",
                            "content-type": "text/plain",
                            "content-disposition": "inline",
                        },
                        statusCode: 401,
                        body: "Missing x-api-key header",
                    };
                }

                if (!event.queryStringParameters) {
                    return {
                        headers: {
                            "Access-Control-Allow-Headers": "Content-Type, x-api-key",
                            "Access-Control-Allow-Origin": "*",
                            "Access-Control-Allow-Methods": "GET, OPTIONS",
                            "content-type": "text/plain",
                            "content-disposition": "inline",
                        },
                        statusCode: 400,
                        body: "Missing query string parameters",
                    };
                }

                const { projectId } = event.queryStringParameters;
                if (!projectId) {
                    return {
                        headers: {
                            "Access-Control-Allow-Headers": "Content-Type, x-api-key",
                            "Access-Control-Allow-Origin": "*",
                            "Access-Control-Allow-Methods": "GET, OPTIONS",
                            "content-type": "text/plain",
                            "content-disposition": "inline",
                        },
                        statusCode: 400,
                        body: "Missing projectId",
                    };
                }

                // download the report template from S3
                const s3 = new SDK.S3();
                const options = {
                    Bucket: 'hourly-tracker-files',
                    Key: "template.xlsx",
                };
                const template = await s3.getObject(options).promise().then((data: SDK.S3.GetObjectOutput) => data.Body) ?? Buffer;


                const CLOCKIFY_API_KEY = event.headers['x-api-key'];
                const personalizedReport = await generateReport(projectId, template, CLOCKIFY_API_KEY);

                return {
                    statusCode: 200,
                    isBase64Encoded: true,
                    body: personalizedReport,
                    headers: {
                        "Access-Control-Allow-Headers": "Content-Type, x-api-key",
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "GET, OPTIONS",
                        "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        "content-disposition": "attachment; filename=clockify.xlsx",
                    },
                };

            },
        },
        {
            path: "/report",
            method: "OPTIONS",
            eventHandler: async () => {
                return {
                    headers: {
                        "Access-Control-Allow-Headers": "Content-Type, x-api-key",
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "GET, OPTIONS",
                        "content-type": "text/plain",
                        "content-disposition": "inline",
                    },
                    statusCode: 200,
                    body: "",
                };
            }
        }
    ]
});

exports.url = endpoint.url;