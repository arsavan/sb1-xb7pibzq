import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import GeneralSettings from './settings/GeneralSettings';
import AmazonSettingsPanel from './AmazonSettingsPanel';

export default function SettingsPanel() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Paramètres</h2>

      <Tabs defaultValue="general">
        <TabsList className="mb-6">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="amazon">Amazon API</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralSettings />
        </TabsContent>

        <TabsContent value="amazon">
          <AmazonSettingsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}