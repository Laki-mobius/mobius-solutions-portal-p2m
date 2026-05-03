import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle } from "lucide-react";
import { AdminSolutions } from "@/components/admin/AdminSolutions";
import { AdminCollaterals } from "@/components/admin/AdminCollaterals";
import { AdminLogs } from "@/components/admin/AdminLogs";

const Admin = () => {
  return (
    <Layout>
      <div className="border-b-2 border-destructive/40 bg-destructive/10">
        <div className="container flex items-start gap-3 py-3 text-sm">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div>
            <p className="font-semibold text-destructive">Unprotected admin area</p>
            <p className="text-destructive/90">
              This page has no password. Anyone with the URL can edit content and view activity logs. Do not share this URL.
            </p>
          </div>
        </div>
      </div>

      <section className="container py-8">
        <h1 className="mb-1 font-display text-3xl font-bold">Admin</h1>
        <p className="mb-8 text-muted-foreground">
          Manage Solutions, Collaterals, and view activity logs.
        </p>

        <Tabs defaultValue="solutions">
          <TabsList>
            <TabsTrigger value="solutions">Solutions</TabsTrigger>
            <TabsTrigger value="collaterals">Collaterals</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>
          <TabsContent value="solutions" className="mt-6">
            <AdminSolutions />
          </TabsContent>
          <TabsContent value="collaterals" className="mt-6">
            <AdminCollaterals />
          </TabsContent>
          <TabsContent value="logs" className="mt-6">
            <AdminLogs />
          </TabsContent>
        </Tabs>
      </section>
    </Layout>
  );
};

export default Admin;
