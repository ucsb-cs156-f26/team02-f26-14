import React from "react";
import HelpRequestCreatePage from "main/pages/HelpRequest/HelpRequestCreatePage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";
import { http, HttpResponse } from "msw";

export default {
  title: "pages/HelpRequest/HelpRequestCreatePage",
  component: HelpRequestCreatePage,
};

const Template = () => <HelpRequestCreatePage storybook={true} />;

export const Default = Template.bind({});

Default.parameters = {
  msw: [
    http.get("/api/currentUser", () =>
      HttpResponse.json(apiCurrentUserFixtures.adminUser),
    ),
    http.get("/api/systemInfo", () =>
      HttpResponse.json(systemInfoFixtures.showingNeither),
    ),
    http.post("/api/helprequest/post", () =>
      HttpResponse.json(helpRequestFixtures.oneHelpRequest),
    ),
  ],
};
