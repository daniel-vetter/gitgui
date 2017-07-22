import { TabManager, Tab } from "./tab-manager";
import { HistoryTab } from "../main/tabs/tabs";

describe(TabManager.name, () => {
    interface EventRecord {
        eventType: string;
        selectedTab: Tab | undefined;
        allTabs: Tab[];
    }

    function monitorEvents(x: TabManager): EventRecord[] {
        const events: EventRecord[] = [];
        x.onTabListChanged.subscribe(() => {
            events.push({ eventType: "onTabListChanged", selectedTab: x.selectedTab, allTabs: Array.from(x.allTabs) });
        });

        x.onSelectedTabChanged.subscribe(() => {
            events.push({ eventType: "onSelectedTabChanged", selectedTab: x.selectedTab, allTabs: Array.from(x.allTabs) });
        });
        return events;
    }

    it("A fresh TabManager should contain no tabs", () => {
        expect(new TabManager().allTabs.length).toBe(0);
    });

    describe("Adding a tab", () => {

        const tabManager = new TabManager();
        const tab = new HistoryTab();
        tabManager.createNewTab(tab);

        it("should add a tab to the tab list", () => {
            expect(tabManager.allTabs.length).toBe(1);
        });

        it("should select the new tab", () => {
            expect(tabManager.selectedTab).toBe(tab);
        });
    });

    describe("Adding a tab", () => {
        it("should fire all events in the correct order", () => {
            const tabManager = new TabManager();
            const tab = new HistoryTab();
            const events = monitorEvents(tabManager);

            tabManager.createNewTab(tab);

            expect(events).toEqual(<EventRecord[]>[
                { eventType: "onTabListChanged", selectedTab: undefined, allTabs: [tab] },
                { eventType: "onSelectedTabChanged", selectedTab: tab, allTabs: [tab] }
            ]);
        });
    });

    describe("After removing the last tab", () => {

        const tabManager = new TabManager();
        const tab = new HistoryTab();
        tabManager.createNewTab(tab);
        tabManager.closeTab(tab);

        it("should not have any tabs", () => {
            expect(tabManager.allTabs.length).toBe(0);
        });

        it("should not have any tab selected", () => {
            expect(tabManager.selectedTab).toBe(undefined);
        });
    });

    describe("Removing the last tab", () => {
        it("should fire all events in the correct order", () => {
            const tabManager = new TabManager();
            const tab = new HistoryTab();
            tabManager.createNewTab(tab);
            const events = monitorEvents(tabManager);

            tabManager.closeTab(tab);

            expect(events).toEqual(<EventRecord[]>[
                { eventType: "onSelectedTabChanged", selectedTab: undefined, allTabs: [tab] },
                { eventType: "onTabListChanged", selectedTab: undefined, allTabs: [] }
            ]);
        });
    });

    describe("Changing the selected tab", () => {

        const tabManager = new TabManager();
        tabManager.createNewTab(new HistoryTab());
        tabManager.createNewTab(new HistoryTab());
        tabManager.createNewTab(new HistoryTab());
        let eventFired = false;
        tabManager.onSelectedTabChanged.subscribe(() => eventFired = true);

        tabManager.selectedTab = tabManager.allTabs[1];

        it("should change the selected tab", () => {
            expect(tabManager.selectedTab).toBe(tabManager.allTabs[1]);
        });

        it("should fire the selectedTabChanged event", () => {
            expect(eventFired).toBe(true);
        });
    });

    describe("Changing away from a temporary tab", () =>  {
        const tabManager = new TabManager();
        const persistentTab = new HistoryTab();
        const tempTab = new HistoryTab();
        tempTab.ui.isPersistent = false;
        tabManager.createNewTab(persistentTab);
        tabManager.createNewTab(tempTab);
        const events = monitorEvents(tabManager);
        tabManager.selectedTab = persistentTab;

        it("should close the temporary tab", () => expect(tabManager.allTabs).not.toContain(tempTab));
        it("should selected the persistent tab", () => expect(tabManager.selectedTab).toBe(persistentTab));
        it("should fire event in correct order", () =>  {
            expect(events).toEqual(<EventRecord[]>[
                { eventType: "onSelectedTabChanged", selectedTab: persistentTab, allTabs: [persistentTab, tempTab] },
                { eventType: "onTabListChanged", selectedTab: persistentTab, allTabs: [persistentTab] }
            ]);
        })
    });

    describe("Creating a new tab if a temporary tab is currently selected", () =>  {
        const tabManager = new TabManager();
        const persistentTab = new HistoryTab();
        const tempTab = new HistoryTab();
        tempTab.ui.isPersistent = false;
        tabManager.createNewTab(tempTab);
        const events = monitorEvents(tabManager);
        tabManager.createNewTab(persistentTab);


        it("should close the temporary tab", () => expect(tabManager.allTabs).not.toContain(tempTab));
        it("should selected the persistent tab", () => expect(tabManager.selectedTab).toBe(persistentTab));
        it("should fire event in correct order", () =>  {
            expect(events).toEqual(<EventRecord[]>[
                { eventType: "onTabListChanged", selectedTab: tempTab, allTabs: [tempTab, persistentTab] },
                { eventType: "onSelectedTabChanged", selectedTab: persistentTab, allTabs: [tempTab, persistentTab] },
                { eventType: "onTabListChanged", selectedTab: persistentTab, allTabs: [persistentTab] }
            ]);
        })
    })
});
