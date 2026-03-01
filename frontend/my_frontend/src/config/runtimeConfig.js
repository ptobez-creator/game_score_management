const trimTrailingSlash = (url) => url.replace(/\/+$/, '');

const DEFAULT_API_URL = 'http://localhost:5000';

const normalizeApiUrl = (value) => {
	const normalizedValue = (value || '').toString().trim();

	if (!normalizedValue) {
		return DEFAULT_API_URL;
	}

	if (normalizedValue.toLowerCase() === 'undefined' || normalizedValue.toLowerCase() === 'null') {
		return DEFAULT_API_URL;
	}

	return normalizedValue;
};

const envApiUrl = normalizeApiUrl(process.env.REACT_APP_API_URL);

export const API_URL = trimTrailingSlash(envApiUrl);
export const LOCAL_API_URL = DEFAULT_API_URL;
