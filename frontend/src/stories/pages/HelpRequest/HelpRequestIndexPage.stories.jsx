import React from "react";
import HelpRequestIndexPage from "main/pages/HelpRequest/HelpRequestIndexPage";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";

export default {
  title: "pages/HelpRequest/HelpRequestIndexPage",
  component: HelpRequestIndexPage,
};

const Template = () => <HelpRequestIndexPage />;

const commonHandlers = [
  http.get("/api/systemInfo", () =>
    HttpResponse.json(systemInfoFixtures.showingNeither),
  ),
];

export const Empty = Template.bind({});
Empty.parameters = {
  msw: [
    ...commonHandlers,
    http.get("/api/currentUser", () =>
      HttpResponse.json(apiCurrentUserFixtures.userOnly),
    ),
    http.get("/api/helprequests/all", () => HttpResponse.json([])),
  ],
};

export const ThreeItemsOrdinaryUser = Template.bind({});
ThreeItemsOrdinaryUser.parameters = {
  msw: [
    ...commonHandlers,
    http.get("/api/currentUser", () =>
      HttpResponse.json(apiCurrentUserFixtures.userOnly),
    ),
    http.get("/api/helprequests/all", () =>
      HttpResponse.json(helpRequestFixtures.threeHelpRequest),
    ),
  ],
};

export const ThreeItemsAdminUser = Template.bind({});
ThreeItemsAdminUser.parameters = {
  msw: [
    ...commonHandlers,
    http.get("/api/currentUser", () =>
      HttpResponse.json(apiCurrentUserFixtures.adminUser),
    ),
    http.get("/api/helprequests/all", () =>
      HttpResponse.json(helpRequestFixtures.threeHelpRequest),
    ),
    http.delete("/api/helprequests", () =>
      HttpResponse.json({}, { status: 200 }),
    ),
  ],
};
