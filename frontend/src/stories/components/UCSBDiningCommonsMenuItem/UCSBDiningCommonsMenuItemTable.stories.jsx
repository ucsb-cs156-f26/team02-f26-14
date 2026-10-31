import React from "react";

import UCSBDiningCommonsMenuItemTable from "main/components/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemTable";

import { ucsbDiningCommonsMenuItemFixtures } from "fixtures/ucsbDiningCommonsMenuItemFixtures";

export default {
  title: "components/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemTable",
  component: UCSBDiningCommonsMenuItemTable,
};

const Template = (args) => {
  return <UCSBDiningCommonsMenuItemTable {...args} />;
};

export const Empty = Template.bind({});
Empty.args = {
  ucsbDiningCommonsMenuItems: [],
};

export const ThreeItems = Template.bind({});
ThreeItems.args = {
  ucsbDiningCommonsMenuItems:
    ucsbDiningCommonsMenuItemFixtures.threeUCSBDiningCommonsMenuItems,
};
