import React from "react";
import HelpRequestEditPage from "main/pages/HelpRequest/HelpRequestEditPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";
import { http, HttpResponse } from "msw";

export default {
  title: "pages/HelpRequest/HelpRequestEditPage",
  component: HelpRequestEditPage,
};

const Template = () => <HelpRequestEditPage storybook={true} />;

export const Default = Template.bind({});

Default.parameters = {
  msw: [
    http.get("/api/currentUser", () =>
      HttpResponse.json(apiCurrentUserFixtures.adminUser),
    ),
    http.get("/api/systemInfo", () =>
      HttpResponse.json(systemInfoFixtures.showingNeither),
    ),
    http.get("/api/helprequest", () =>
      HttpResponse.json(helpRequestFixtures.oneHelpRequest),
    ),
    http.put("/api/helprequest", () =>
      HttpResponse.json(helpRequestFixtures.oneHelpRequest),
    ),
  ],
};
