export function decodeToken(token) {
	if (!token) return null;
	try {
		const payload = token.split('.')[1];
		const decoded = JSON.parse(atob(payload));
		return decoded;
	} catch {
		return null;
	}
}

export function getRoleFromToken(token) {
	const decoded = decodeToken(token);
	return decoded?.role || null;
}
