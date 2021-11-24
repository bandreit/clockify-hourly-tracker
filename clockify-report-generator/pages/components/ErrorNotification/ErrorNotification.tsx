import React from 'react'

interface Props {
    error: string;
    setIsErrorisErrorPresent: (isErrorPresent: boolean) => void;
}

const ErrorNotification = (props: Props) => {
    const { error, setIsErrorisErrorPresent } = props;
    return (
        <div className="notification is-danger">
            <button className="delete" onClick={() => setIsErrorisErrorPresent(false)} ></button>
            <strong>{error}</strong>
        </div>
    )
}

export default ErrorNotification
