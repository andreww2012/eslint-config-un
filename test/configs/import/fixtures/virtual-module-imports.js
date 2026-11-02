import {getCollection} from 'astro:content';
import {Database} from 'bun:sqlite';
import {goto} from '$app/navigation';

export const value = [getCollection, Database, goto];
