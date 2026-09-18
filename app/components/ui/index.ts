// Barrel for the UI kit — one import path for every primitive/compound.
//   import { Modal, Tabs, Select, Checkbox, Alert } from "@/app/components/ui";
//
// Note: default-export primitives (Button, Card, Badge, Input, PageHeader,
// Skeleton, Table) are re-exported here as named exports for convenience.

// Named-export components
export * from "./alert";
export * from "./avatar";
export * from "./breadcrumb";
export * from "./checkbox";
export * from "./datetime-input";
export * from "./dialog";
export * from "./dropdown-menu";
export * from "./empty";
export * from "./field";
export * from "./file-upload";
export * from "./label";
export * from "./modal";
export * from "./pagination";
export * from "./progress";
export * from "./radio-group";
export * from "./select";
export * from "./separator";
export * from "./switch";
export * from "./tabs";
export * from "./textarea";
export * from "./tooltip";

// Default-export primitives → named re-exports
export { default as Button } from "./Button";
export { default as Card, CardHeader, CardBody } from "./Card";
export { default as Badge } from "./Badge";
export { default as Input, inputBase } from "./Input";
export { default as PageHeader } from "./PageHeader";
export { default as Skeleton } from "./Skeleton";
export { default as Table } from "./Table";
export * from "./DataTable";
export { default as BackLink } from "./BackLink";
