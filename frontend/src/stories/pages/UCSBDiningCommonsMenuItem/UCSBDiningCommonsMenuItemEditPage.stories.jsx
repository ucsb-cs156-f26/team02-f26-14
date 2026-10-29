import React from "react";
import { http, HttpResponse } from "msw";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { ucsbDiningCommonsMenuItemFixtures } from "fixtures/ucsbDiningCommonsMenuItemFixtures";

import UCSBDiningCommonsMenuItemEditPage from "main/pages/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemEditPage";

export default {
  title: "pages/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemEditPage",
  component: UCSBDiningCommonsMenuItemEditPage,
};

const Template = () => <UCSBDiningCommonsMenuItemEditPage storybook={true} />;

export const Default = Template.bind({});

Default.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.adminUser);
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither);
    }),
    http.get("/api/UCSBDiningCommonsMenuItem", () => {
      return HttpResponse.json(
        ucsbDiningCommonsMenuItemFixtures.oneUCSBDiningCommonsMenuItem,
      );
    }),
    http.put("/api/UCSBDiningCommonsMenuItem", async ({ request }) => {
      const updatedItem = await request.json();

      return HttpResponse.json({
        ...ucsbDiningCommonsMenuItemFixtures.oneUCSBDiningCommonsMenuItem,
        ...updatedItem,
      });
    }),
  ],
};
