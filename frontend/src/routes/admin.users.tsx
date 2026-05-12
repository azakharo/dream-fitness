import {Outlet, createFileRoute} from '@tanstack/react-router';

/**
 * Layout route for user management pages.
 * Renders an Outlet to allow child routes (like user detail) to render.
 */
export const Route = createFileRoute('/admin/users')({
  component: Outlet,
});
