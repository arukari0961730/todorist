const TEAMS_STORAGE_KEY =
  "taskManagerTeams";

const ACTIVE_TEAM_STORAGE_KEY =
  "taskManagerActiveTeamId";

export const DEFAULT_TEAM_ID =
  "team-personal";

const DEFAULT_TEAMS = [
  {
    id: DEFAULT_TEAM_ID,
    name: "個人ゲーム制作チーム"
  },
  {
    id: "team-multiplayer",
    name: "マルチゲーム制作チーム"
  },
  {
    id: "team-serious",
    name: "ガッツリゲーム制作チーム"
  }
];

export const teams = [];

let activeTeamId = "";

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function createSafeText(
  value,
  fallback = ""
) {
  if (
    value === null ||
    value === undefined
  ) {
    return fallback;
  }

  const text =
    String(value).trim();

  return text !== ""
    ? text
    : fallback;
}

function copyDefaultTeams() {
  return DEFAULT_TEAMS.map(
    function (team) {
      return {
        ...team
      };
    }
  );
}

function createUniqueTeamId() {
  let id =
    "team-" + Date.now();

  let number = 1;

  while (
    teams.some(
      function (team) {
        return team.id === id;
      }
    )
  ) {
    id =
      "team-" +
      Date.now() +
      "-" +
      number;

    number++;
  }

  return id;
}

function normalizeTeam(
  team,
  usedIds
) {
  if (!isPlainObject(team)) {
    return null;
  }

  const name =
    createSafeText(team.name);

  if (name === "") {
    return null;
  }

  let id =
    createSafeText(team.id);

  if (
    id === "" ||
    usedIds.has(id)
  ) {
    id =
      "team-" +
      Date.now() +
      "-" +
      usedIds.size;
  }

  usedIds.add(id);

  return {
    id,
    name: name.slice(0, 30)
  };
}

function normalizeTeamArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  const usedIds =
    new Set();

  return value
    .map(
      function (team) {
        return normalizeTeam(
          team,
          usedIds
        );
      }
    )
    .filter(
      function (team) {
        return team !== null;
      }
    );
}

function replaceTeams(newTeams) {
  teams.splice(
    0,
    teams.length,
    ...newTeams
  );
}

function getStoredTeams(parsedData) {
  if (Array.isArray(parsedData)) {
    return parsedData;
  }

  if (
    isPlainObject(parsedData) &&
    Array.isArray(parsedData.teams)
  ) {
    return parsedData.teams;
  }

  return [];
}

function saveTeamState() {
  try {
    localStorage.setItem(
      TEAMS_STORAGE_KEY,
      JSON.stringify(teams)
    );

    localStorage.setItem(
      ACTIVE_TEAM_STORAGE_KEY,
      activeTeamId
    );

    return true;
  } catch (error) {
    console.error(
      "チームデータの保存に失敗しました",
      error
    );

    return false;
  }
}

function backupBrokenTeamData(
  brokenData
) {
  if (!brokenData) {
    return;
  }

  try {
    localStorage.setItem(
      TEAMS_STORAGE_KEY +
        "_broken_" +
        Date.now(),
      brokenData
    );
  } catch (error) {
    console.error(
      "壊れたチームデータのバックアップに失敗しました",
      error
    );
  }
}

export function loadTeams() {
  let storedTeamsText = null;
  let storedActiveTeamId = "";

  try {
    storedTeamsText =
      localStorage.getItem(
        TEAMS_STORAGE_KEY
      );

    storedActiveTeamId =
      createSafeText(
        localStorage.getItem(
          ACTIVE_TEAM_STORAGE_KEY
        )
      );
  } catch (error) {
    console.error(
      "チームデータの読み込みに失敗しました",
      error
    );
  }

  let loadedTeams = [];

  if (storedTeamsText) {
    try {
      loadedTeams =
        normalizeTeamArray(
          getStoredTeams(
            JSON.parse(
              storedTeamsText
            )
          )
        );
    } catch (error) {
      console.error(
        "保存されたチームデータが壊れています",
        error
      );

      backupBrokenTeamData(
        storedTeamsText
      );
    }
  }

  if (loadedTeams.length === 0) {
    loadedTeams =
      copyDefaultTeams();
  }

  replaceTeams(loadedTeams);

  const canKeepActiveTeam =
    teams.some(
      function (team) {
        return (
          team.id ===
          storedActiveTeamId
        );
      }
    );

  activeTeamId =
    canKeepActiveTeam
      ? storedActiveTeamId
      : teams[0].id;

  saveTeamState();

  return getTeams();
}

export function saveTeams() {
  const normalizedTeams =
    normalizeTeamArray(teams);

  if (normalizedTeams.length === 0) {
    replaceTeams(
      copyDefaultTeams()
    );
  } else {
    replaceTeams(
      normalizedTeams
    );
  }

  if (!hasTeam(activeTeamId)) {
    activeTeamId =
      teams[0].id;
  }

  return saveTeamState();
}

export function getTeams() {
  return teams.map(
    function (team) {
      return {
        ...team
      };
    }
  );
}

export function hasTeam(teamId) {
  const normalizedId =
    createSafeText(teamId);

  return teams.some(
    function (team) {
      return team.id === normalizedId;
    }
  );
}

export function getActiveTeamId() {
  if (!hasTeam(activeTeamId)) {
    activeTeamId =
      teams[0]?.id ||
      DEFAULT_TEAM_ID;
  }

  return activeTeamId;
}

export function getFallbackTeamId() {
  return getActiveTeamId();
}

export function getActiveTeam() {
  const id =
    getActiveTeamId();

  return (
    teams.find(
      function (team) {
        return team.id === id;
      }
    ) ?? null
  );
}

export function setActiveTeam(
  teamId
) {
  const normalizedId =
    createSafeText(teamId);

  if (!hasTeam(normalizedId)) {
    return false;
  }

  const oldActiveTeamId =
    activeTeamId;

  activeTeamId =
    normalizedId;

  if (!saveTeamState()) {
    activeTeamId =
      oldActiveTeamId;

    return false;
  }

  return true;
}

export function addTeam(teamName) {
  const normalizedName =
    createSafeText(teamName);

  if (normalizedName === "") {
    return {
      success: false,
      message: "チーム名を入力してください"
    };
  }

  if (normalizedName.length > 30) {
    return {
      success: false,
      message: "チーム名は30文字以内にしてください"
    };
  }

  const duplicated =
    teams.some(
      function (team) {
        return (
          team.name.toLocaleLowerCase(
            "ja"
          ) ===
          normalizedName.toLocaleLowerCase(
            "ja"
          )
        );
      }
    );

  if (duplicated) {
    return {
      success: false,
      message: "同じ名前のチームが存在します"
    };
  }

  const oldTeams =
    getTeams();

  const oldActiveTeamId =
    activeTeamId;

  const newTeam = {
    id: createUniqueTeamId(),
    name: normalizedName
  };

  teams.push(newTeam);
  activeTeamId = newTeam.id;

  if (!saveTeamState()) {
    replaceTeams(oldTeams);
    activeTeamId =
      oldActiveTeamId;

    return {
      success: false,
      message: "チームを保存できませんでした"
    };
  }

  return {
    success: true,
    team: {
      ...newTeam
    }
  };
}

export function deleteTeam(teamId) {
  if (teams.length <= 1) {
    return {
      success: false,
      message: "最後の1チームは削除できません"
    };
  }

  const normalizedId =
    createSafeText(teamId);

  const teamIndex =
    teams.findIndex(
      function (team) {
        return team.id === normalizedId;
      }
    );

  if (teamIndex === -1) {
    return {
      success: false,
      message: "削除するチームが見つかりません"
    };
  }

  const oldTeams =
    getTeams();

  const oldActiveTeamId =
    activeTeamId;

  const deletedTeam =
    teams[teamIndex];

  teams.splice(
    teamIndex,
    1
  );

  if (
    activeTeamId ===
    normalizedId
  ) {
    activeTeamId =
      teams[
        Math.min(
          teamIndex,
          teams.length - 1
        )
      ].id;
  }

  if (!saveTeamState()) {
    replaceTeams(oldTeams);
    activeTeamId =
      oldActiveTeamId;

    return {
      success: false,
      message: "チームを削除できませんでした"
    };
  }

  return {
    success: true,
    deletedTeam: {
      ...deletedTeam
    },
    activeTeamId:
      getActiveTeamId()
  };
}

loadTeams();
