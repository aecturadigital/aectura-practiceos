"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Tenant, PlanId } from "@/types";
import { mockStore } from "@/lib/mock/store";
import { getPlan, PlanDefinition, FeatureKey, hasFeature } from "@/lib/plans";
import { getVerticalConfig, VerticalConfig } from "@/lib/verticals";

interface TenantContextType {
  activeTenant: Tenant;
  tenants: Tenant[];
  plan: PlanDefinition;
  vertical: VerticalConfig;
  switchTenant: (idOrSlug: string) => void;
  switchPlan: (planId: PlanId) => void;
  hasAccess: (feature: FeatureKey) => boolean;
  resetDemoData: () => void;
  isStoreReady: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenants, setTenants] = useState<Tenant[]>(() => mockStore.getTenants());
  const [activeTenant, setActiveTenant] = useState<Tenant>(() => mockStore.getActiveTenant());
  const [isStoreReady, setIsStoreReady] = useState(false);

  useEffect(() => {
    setIsStoreReady(true);
    const unsubscribe = mockStore.subscribe(() => {
      setTenants([...mockStore.getTenants()]);
      setActiveTenant({ ...mockStore.getActiveTenant() });
    });
    return () => unsubscribe();
  }, []);

  const switchTenant = (idOrSlug: string) => {
    mockStore.setActiveTenant(idOrSlug);
    const t = mockStore.getActiveTenant();
    setActiveTenant({ ...t });
  };

  const switchPlan = (planId: PlanId) => {
    mockStore.updateTenantPlan(activeTenant.id, planId);
    const t = mockStore.getActiveTenant();
    setActiveTenant({ ...t });
  };

  const plan = getPlan(activeTenant.planId);
  const vertical = getVerticalConfig(activeTenant.verticalId);

  const checkFeature = (feature: FeatureKey): boolean => {
    return hasFeature(activeTenant.planId, feature);
  };

  const resetDemoData = () => {
    mockStore.resetToDefaults();
    setTenants([...mockStore.getTenants()]);
    setActiveTenant({ ...mockStore.getActiveTenant() });
  };

  return (
    <TenantContext.Provider
      value={{
        activeTenant,
        tenants,
        plan,
        vertical,
        switchTenant,
        switchPlan,
        hasAccess: checkFeature,
        resetDemoData,
        isStoreReady,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant(): TenantContextType {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
}
