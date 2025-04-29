import React, { useState, useEffect } from "react";
import "./assets/style.css";

type ColorSetting = {
  projectId: string;
  color: string;
};

type Settings = {
  [projectId: string]: string;
};

function IndexPopup() {
  const [projectId, setProjectId] = useState("");
  const [color, setColor] = useState("#ffffff"); // Default to white
  const [settings, setSettings] = useState<ColorSetting[]>([]);
  const [loading, setLoading] = useState(true);

  // Load settings from storage when the popup opens
  useEffect(() => {
    chrome.storage.sync.get(["projectColors"], (result) => {
      const storedSettings: Settings = result.projectColors || {};
      const loadedSettings = Object.entries(storedSettings).map(
        ([projectId, color]) => ({ projectId, color })
      );
      setSettings(loadedSettings);
      setLoading(false);
    });
  }, []);

  // Save settings to storage
  const saveSettings = (newSettings: ColorSetting[]) => {
    const settingsToSave: Settings = newSettings.reduce((acc, setting) => {
      acc[setting.projectId] = setting.color;
      return acc;
    }, {} as Settings);
    chrome.storage.sync.set({ projectColors: settingsToSave });
  };

  // Handle adding a new setting
  const handleAddSetting = () => {
    if (!projectId) {
      alert("Project ID を入力してください。");
      return;
    }
    const newSetting = { projectId, color };
    const updatedSettings = [...settings, newSetting];
    setSettings(updatedSettings);
    saveSettings(updatedSettings);
    setProjectId(""); // Clear input fields
    setColor("#ffffff");
  };

  // Handle deleting a setting
  const handleDeleteSetting = (idToDelete: string) => {
    const updatedSettings = settings.filter(
      (setting) => setting.projectId !== idToDelete
    );
    setSettings(updatedSettings);
    saveSettings(updatedSettings);
  };

  if (loading) {
    return <div className="p-4 w-80 text-center">読み込み中...</div>;
  }

  return (
    <div className="p-4 w-80 space-y-4">
      <h1 className="text-xl font-bold text-center mb-4">
        Firebase 背景色設定
      </h1>

      {/* Input Form */}
      <div className="space-y-2 border p-3 rounded">
        <h2 className="text-lg font-semibold">新規設定追加</h2>
        <div>
          <label
            htmlFor="projectId"
            className="block text-sm font-medium text-gray-700"
          >
            Project ID:
          </label>
          <input
            type="text"
            id="projectId"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            placeholder="your-firebase-project-id"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="flex items-center space-x-2">
          <label
            htmlFor="color"
            className="block text-sm font-medium text-gray-700"
          >
            背景色:
          </label>
          <input
            type="color"
            id="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="mt-1 h-8 w-16 border border-gray-300 rounded-md cursor-pointer"
          />
          <span className="text-sm">{color}</span>
        </div>
        <button
          onClick={handleAddSetting}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          追加
        </button>
      </div>

      {/* Settings List */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">設定済みリスト</h2>
        {settings.length === 0 ? (
          <p className="text-gray-500">設定はありません。</p>
        ) : (
          <ul className="space-y-2">
            {settings.map((setting) => (
              <li
                key={setting.projectId}
                className="flex justify-between items-center p-2 border rounded bg-gray-50"
              >
                <div className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: setting.color }}
                  ></div>
                  <span className="font-mono text-sm">{setting.projectId}</span>
                </div>

                <button
                  onClick={() => handleDeleteSetting(setting.projectId)}
                  className="px-2 py-1 text-xs text-red-600 hover:text-red-800"
                  title="削除"
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default IndexPopup;
