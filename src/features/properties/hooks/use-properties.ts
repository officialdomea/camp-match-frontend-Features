import { queryOptions, useQuery } from "@tanstack/react-query";
import { propertyService } from "../services/property.service";
import type { PropertyListParams } from "@/types/property";

export const propertyKeys = {
  ownerDashboard: ["properties", "owner-dashboard"] as const,
  ownerProperties: (params: PropertyListParams = {}) => ["properties", "owner", params] as const,
  property: (id: string) => ["properties", "detail", id] as const,
  authorizedScouts: ["properties", "authorized-scouts"] as const,
  scoutDashboard: ["properties", "scout-dashboard"] as const,
  managedProperties: (params: PropertyListParams = {}) =>
    ["properties", "managed", params] as const,
  managedProperty: (id: string) => ["properties", "managed-detail", id] as const,
};

export const ownerDashboardQuery = () =>
  queryOptions({
    queryKey: propertyKeys.ownerDashboard,
    queryFn: () => propertyService.getOwnerDashboard(),
  });

export const ownerPropertiesQuery = (params: PropertyListParams = {}) =>
  queryOptions({
    queryKey: propertyKeys.ownerProperties(params),
    queryFn: () => propertyService.getOwnerProperties(params),
  });

export const propertyDetailQuery = (id: string) =>
  queryOptions({
    queryKey: propertyKeys.property(id),
    queryFn: () => propertyService.getProperty(id),
    enabled: Boolean(id),
  });

export const authorizedScoutsQuery = () =>
  queryOptions({
    queryKey: propertyKeys.authorizedScouts,
    queryFn: () => propertyService.getAuthorizedScouts(),
  });

export const scoutDashboardQuery = () =>
  queryOptions({
    queryKey: propertyKeys.scoutDashboard,
    queryFn: () => propertyService.getScoutDashboard(),
  });

export const managedPropertiesQuery = (params: PropertyListParams = {}) =>
  queryOptions({
    queryKey: propertyKeys.managedProperties(params),
    queryFn: () => propertyService.getManagedProperties(params),
  });

export const managedPropertyQuery = (id: string) =>
  queryOptions({
    queryKey: propertyKeys.managedProperty(id),
    queryFn: () => propertyService.getManagedProperty(id),
    enabled: Boolean(id),
  });

export const useOwnerDashboard = () => useQuery(ownerDashboardQuery());
export const useOwnerProperties = (params: PropertyListParams = {}) =>
  useQuery(ownerPropertiesQuery(params));
export const useProperty = (id: string) => useQuery(propertyDetailQuery(id));
export const useAuthorizedScouts = () => useQuery(authorizedScoutsQuery());
export const useScoutDashboard = () => useQuery(scoutDashboardQuery());
export const useManagedProperties = (params: PropertyListParams = {}) =>
  useQuery(managedPropertiesQuery(params));
export const useManagedProperty = (id: string) => useQuery(managedPropertyQuery(id));
