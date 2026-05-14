import { Course } from './types';
import generated from './content/courses.json';

/**
 * Courses come from Markdown files under content/, parsed by
 * scripts/build-content.ts into src/content/courses.json.
 * Do NOT edit courses.json by hand — edit the Markdown instead and
 * run `npm run build:content` (or just `npm run build`).
 */
export const courses: Course[] = generated as Course[];
