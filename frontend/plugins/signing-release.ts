import {
    ConfigPlugin,
    withAppBuildGradle,
} from 'expo/config-plugins';

export const withSigningRelease: ConfigPlugin = (config) => {
    return withAppBuildGradle(config, (config) => {
        if (config) {
            config.modResults.contents = ""
        }
        
        return config;
    });
};