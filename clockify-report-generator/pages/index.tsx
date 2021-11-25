import type { NextPage } from 'next'
import Head from 'next/head'
import React from 'react'
import styles from '../styles/Home.module.css'
import ProjectGrid from '../pages/components/ProjectGrid'
import ErrorNotification from '../pages/components/ErrorNotification'
import { useEffect, useState } from 'react'
import axios, { AxiosError } from 'axios'
import Image from 'next/image';

const Home: NextPage = () => {

  const [isLoading, setisLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isErrorPresent, setIsErrorisErrorPresent] = useState(false);
  const [apiKey, setApiKey] = useState('');

  useEffect(function () {
    if (typeof window !== "undefined") {
      if (window.localStorage.getItem('apiKey')) {
        setApiKey(window.localStorage.getItem('apiKey')!);
      }
    }
  }, []);

  const fetchProjects = async () => {
    try {
      setisLoading(true);
      if (typeof window !== "undefined")
        localStorage.setItem('apiKey', apiKey);

      const response = await axios.get(`api/projects`, { headers: { 'X-Api-Key': apiKey } });
      const { name, projects } = response.data;

      setName(name);
      setProjects(projects);
      setisLoading(false);
      setIsErrorisErrorPresent(false);
    } catch (error: AxiosError | any) {
      setisLoading(false);
      switch (error.response.status) {
        case 401:
          setError('Uh-oh! That API key you\'re trying to use is invalid :(');
          setIsErrorisErrorPresent(true);
          break;
        case 404:
          setError('Uh-oh! It looks like you don\'t have any projects. Please set the hours to a certain project ^^.');
          setIsErrorisErrorPresent(true);
          break;
        default:
          console.log(error);
          setError('Uh-oh! Something went really bad :( Try to contact Andrei Bostan, he might help you');
          setIsErrorisErrorPresent(true);
          break;
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex">
        <Image src="/spinner.svg" alt="loading spinner" height={500} width={500} />
      </div>)
  }

  return (
    <div className={styles.wrapper}>
      <Head>
        <title>LEGO Report Generator</title>
        <meta name="description" content="A helper for the studenr workers at LEGO to generate their monthly hours report" />
        <link rel="icon" href="/LEGO.png" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css" />
      </Head>

      <div className="container is-max-desktop p-4">
        <p className="title is-2">Your Clockify API Key:</p>
        <div className="block">
          <div className="field is-grouped">
            <div className="control is-expanded">
              <input
                className={isErrorPresent ? 'input is-large is-danger' : 'input is-large'}
                type="text"
                value={apiKey}
                placeholder="API Key"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    fetchProjects();
                  }
                }}
                onChange={(e) => {
                  setApiKey(e.target.value);
                }}
              />
            </div>
            <div className="control">
              <button
                onClick={() => { fetchProjects() }}
                className="button is-primary is-large">Fetch Projects</button>
            </div>
          </div>
          {isErrorPresent && <ErrorNotification error={error} setIsErrorisErrorPresent={() => setIsErrorisErrorPresent(false)} />}
          <p className="is-subtitile">
            Set up a Clockify account {' '}
            <a
              rel="noreferrer"
              href="https://clockify.me/signup"
              target="_blank">here
            </a >
          </p>
          <p className="is-subtitile">
            Get your API key at the bottom of the page{' '}
            <a
              rel="noreferrer"
              href="https://clockify.me/user/settings"
              target="_blank">
              here
            </a >
          </p>
          <p className="is-subtitile">
            Enable the Timesheef functionality for a better time logging experience{' '}
            <a
              rel="noreferrer"
              href="https://mandrillapp.com/track/click/30171113/clockify.me?p=eyJzIjoiWmFYdGFOdmo0NHNiTy10R1ptWW83OVBhWnM4IiwidiI6MSwicCI6IntcInVcIjozMDE3MTExMyxcInZcIjoxLFwidXJsXCI6XCJodHRwczpcXFwvXFxcL2Nsb2NraWZ5Lm1lXFxcL3dvcmtzcGFjZXNcXFwvNjE5ZTI3ODRiODVjM2UwZTQxNmIyYzk0XFxcL3NldHRpbmdzXCIsXCJpZFwiOlwiMzEwNGI3MDZiNDcxNDQ1NjhjMTc2Y2RmMGU2ZDc0MTZcIixcInVybF9pZHNcIjpbXCIwYWFhN2Q4MDJjNmJiMDU5NjRkYTk3NzdlOTg0ODE3YjUxN2MyMzM5XCJdfSJ9"
              target="_blank">
              here
            </a >
          </p>
          <p className="is-subtitile">
            Confluence page{' '}
            <a
              rel="noreferrer"
              href="https://legogroup.atlassian.net/wiki/spaces/CRG/pages/edit-v2/37129160452"
              target="_blank">
              here
            </a >
          </p>

        </div>
      </div>
      {projects.length > 0 && <ProjectGrid projects={projects} apiKey={apiKey} name={name} />}

    </div>
  )
}

export default Home
