import React from "react";

const withProviderHOC = (providers: Array<React.ComponentType<any> | [React.Provider<any>, Record<'value' | string, any>]>) =>
    (WrappedComponent: React.ComponentType<any>) =>
        (props: React.ComponentProps<any>) =>
            (
                <>
                    {
                        providers.reduceRight((acc, provider) => {
                            if (Array.isArray(provider))
                            {
                                const [Provider, props] = provider;
                                const {value = null} = props;
                                return <Provider value={value} {...props}>{acc}</Provider>
                            }
                            const Provider = provider;
                            return <Provider>{acc}</Provider>
                        }, (<WrappedComponent {...props} />))
                    }
                </>
            );

export default withProviderHOC;