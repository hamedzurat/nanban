import { browser } from '$app/environment';
import { writable, get } from 'svelte/store';
import type { Id } from '../convex/_generated/dataModel';

export type Session = {
	userId: Id<'users'>;
	name: string;
	email: string;
	avatarURL: string | null;
};

const STORAGE_KEY = 'nanban.session.v1';

export const session = writable<Session | null>(null);

export function loadSession(): Session | null {
	if (!browser) return null;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as Session;
		session.set(parsed);
		return parsed;
	} catch {
		localStorage.removeItem(STORAGE_KEY);
		session.set(null);
		return null;
	}
}

export function setSession(next: Session) {
	session.set(next);
	if (browser) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function clearSession() {
	session.set(null);
	if (browser) localStorage.removeItem(STORAGE_KEY);
}

export function isLoggedIn() {
	return get(session) !== null;
}
