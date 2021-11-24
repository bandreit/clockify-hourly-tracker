import React, { useState } from 'react'
import Image from 'next/image'
import axios from 'axios'

type Project = {
    name: string,
    id: string,
    color: string
}

interface Props {
    projects: Project[];
    apiKey: string;
    name: string;
}

const ProjectGrid = (props: Props) => {
    const [isError, setIsError] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isDoneDownloading, setIsDoneDownlading] = useState<boolean>(false);
    const [resultText, setResultText] = useState<string>('');
    const { projects, apiKey, name } = props;
    const generateReport = (projectId: string) => {
        try {
            setIsLoading(true);
            axios.get(`https://sgas7wc9ok.execute-api.eu-west-1.amazonaws.com/stage/report?projectId=${projectId}`, {
                headers: {
                    'x-api-key': apiKey,
                    "Access-Control-Allow-Headers": "Content-Type, x-api-key, content-disposition"
                },
                responseType: 'blob'
            }).then(response => {
                console.log(response);
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', name + '.xlsx');
                document.body.appendChild(link);
                link.click();
                setIsError(true);
                setIsLoading(false);
                setResultText('Report generated! Hope it helped :)');
                setIsDoneDownlading(true);
            });
        }
        catch (e) {
            setIsError(true);
            setIsLoading(false);
            setIsDoneDownlading(true);
            setResultText('Uh-oh, something went wrong. Try again or contac Andrei Bostan :)');
        }
    };

    if (isDoneDownloading) {
        return (<h1 className={`title is-4 ${isError ? 'has-text-success' : 'has-text-danger'} has-text-centered p-6`}> {resultText} </h1>);
    }

    return (
        <div>
            {isLoading ? (
                <div className="has-text-centered">
                    <Image src="/spinner.svg" alt="loading spinner" height={200} width={200} />
                    <h1 className="is-title">Using some magic..</h1>
                </div>)
                : (
                    <div>
                        <hr></hr>
                        <h1 className="title has-text-centered p-2">Select a project to generate the report for:</h1>
                        <div className="wrapper container">
                            {projects.map(project => (
                                <div className="tile is-ancestor p-4 max-w-50" key={project.id} onClick={() => { generateReport(project.id) }}>
                                    <div className="tile is-vertical is-12">
                                        <div className="tile">
                                            <div className="tile is-parent is-horizontal">
                                                <article className="tile is-child notification is-danger">
                                                    <p className="title">{project.name}</p>
                                                    <p className="subtitle">{project.name}</p>
                                                </article>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                            }
                            <style jsx>
                                {`
                .wrapper {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex-wrap: wrap;
                  }
                .max-w-50 {
                    max-width: 400px;
                    cursor: pointer;
                    flex: 1 0 30%
                }
                .max-w-50:active {
                    transform: translateY(2px);
                }
                @media screen and (max-width: 816px) {
                    .max-w-50 {
                        flex: 1 0 50%
                    }
                  }
                @media screen and (max-width: 600px) {
                    .max-w-50 {
                        flex: 1 0 100%
                    }
                }
                `}
                            </style>
                        </div >
                    </div>)}
        </div>
    )
}

export default ProjectGrid
