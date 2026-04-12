"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type FormEvent,
  type ReactNode,
} from "react";
import { Bell, Loader2, Plus, Trash2, Users, X } from "lucide-react";
import {
  buildAdminWaitlistCreateBody,
  createAdminWaitlist,
  deleteAdminWaitlist,
  fetchAdminWaitlists,
  patchAdminWaitlistStatus,
  type Waitlist,
  type WaitlistGender,
  type WaitlistStatus,
} from "@/api/adminWaitlists";
import { formatPhoneDisplay } from "@/lib/formatPhoneDisplay";

type TabId =
  | "SEM1_N"
  | "SEM1_HI"
  | "SEM2_N"
  | "SEM2_HI"
  | "SUMMER"
  | "WINTER";

/** 성별 필터: 전체는 쿼리 생략 */
type GenderFilter = "ALL" | WaitlistGender;

const TABS = [
  { id: "SEM1_N" as const, label: "1학기 N수관", season: "SEMESTER_1" as const, branch: "N" as const },
  { id: "SEM1_HI" as const, label: "1학기 하이엔드관", season: "SEMESTER_1" as const, branch: "Hi-end" as const },
  { id: "SEM2_N" as const, label: "2학기 N수관", season: "SEMESTER_2" as const, branch: "N" as const },
  { id: "SEM2_HI" as const, label: "2학기 하이엔드관", season: "SEMESTER_2" as const, branch: "Hi-end" as const },
  { id: "SUMMER" as const, label: "여름캠프", season: "SUMMER" as const, branch: null },
  { id: "WINTER" as const, label: "겨울캠프", season: "WINTER" as const, branch: null },
] as const;

/** N수관: 나이만 / 하이엔드: 학교·학년 / 캠프: 나이 + 학교·학년 */
type WaitlistTableVariant = "n_branch" | "hi_end" | "camp";

function waitlistTableVariant(tabId: TabId): WaitlistTableVariant {
  if (tabId === "SEM1_N" || tabId === "SEM2_N") return "n_branch";
  if (tabId === "SEM1_HI" || tabId === "SEM2_HI") return "hi_end";
  return "camp";
}

const WAITLIST_TABLE_COL_SPAN: Record<WaitlistTableVariant, number> = {
  n_branch: 9,
  hi_end: 10,
  camp: 11,
};

function formatWaitlistCell(value: string | null | undefined): ReactNode {
  const s = value?.trim();
  if (!s) return <span className="text-sm text-slate-400">—</span>;
  return <span className="text-sm text-slate-600">{s}</span>;
}

const STATUS_LABELS: Record<WaitlistStatus, string> = {
  WAITING: "대기 중",
  CONTACTED: "연락 완료",
  REGISTERED: "등록 완료",
  CANCELED: "취소됨",
};

const STATUS_STYLES: Record<
  WaitlistStatus,
  { bg: string; text: string; border: string }
> = {
  WAITING: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "border-slate-200",
  },
  CONTACTED: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  REGISTERED: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  CANCELED: {
    bg: "bg-red-50",
    text: "text-red-800",
    border: "border-red-200",
  },
};

function formatGenderLabel(gender?: WaitlistGender): ReactNode {
  if (gender === "MALE") {
    return <span className="text-sm font-medium text-blue-500">남성</span>;
  }
  if (gender === "FEMALE") {
    return <span className="text-sm font-medium text-rose-500">여성</span>;
  }
  return <span className="text-sm text-slate-400">—</span>;
}

function formatRegisteredAt(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type DirectAddFieldKey =
  | "name"
  | "phone"
  | "registeredAt"
  | "gender"
  | "isExisting"
  | "age"
  | "school"
  | "grade";

function directAddInputClass(hasError: boolean): string {
  return `w-full rounded-lg border px-3 py-2 text-sm text-slate-800 shadow-sm focus:outline-none disabled:opacity-60 ${
    hasError
      ? "border-red-500 ring-1 ring-red-500 focus:border-red-500 focus:ring-red-500"
      : "border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-200"
  }`;
}

function directAddSelectClass(hasError: boolean): string {
  return `w-full cursor-pointer rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:outline-none disabled:opacity-60 ${
    hasError
      ? "border-red-500 ring-1 ring-red-500 focus:border-red-500 focus:ring-red-500"
      : "border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-200"
  }`;
}

export default function WaitlistsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("SEM1_N");
  const [selectedGender, setSelectedGender] = useState<GenderFilter>("ALL");
  const [items, setItems] = useState<Waitlist[]>([]);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "error">("idle");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [updatingWaitlistId, setUpdatingWaitlistId] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Waitlist | null>(null);
  const [pendingStatus, setPendingStatus] = useState<WaitlistStatus | null>(null);

  const modalOpen = selectedStudent !== null && pendingStatus !== null;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStudentForDelete, setSelectedStudentForDelete] =
    useState<Waitlist | null>(null);
  const [deletingWaitlistId, setDeletingWaitlistId] = useState<number | null>(
    null
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastExiting, setToastExiting] = useState(false);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isDirectAddOpen, setIsDirectAddOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addRegisteredAt, setAddRegisteredAt] = useState("");
  const [addGender, setAddGender] = useState<"" | WaitlistGender>("");
  const [addIsExisting, setAddIsExisting] = useState<boolean | null>(null);
  const [addAge, setAddAge] = useState("");
  const [addSchool, setAddSchool] = useState("");
  const [addGrade, setAddGrade] = useState("");
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addFieldErrors, setAddFieldErrors] = useState<
    Partial<Record<DirectAddFieldKey, boolean>>
  >({});

  const tableVariant = waitlistTableVariant(activeTab);
  const tableColSpan = WAITLIST_TABLE_COL_SPAN[tableVariant];

  const showToast = useCallback((message: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastExiting(false);
    setToastMessage(message);
    toastTimeoutRef.current = setTimeout(() => {
      setToastExiting(true);
      toastTimeoutRef.current = setTimeout(() => {
        setToastMessage(null);
        setToastExiting(false);
        toastTimeoutRef.current = null;
      }, 700);
    }, 2500);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const resetDirectAddForm = useCallback(() => {
    setAddName("");
    setAddPhone("");
    setAddRegisteredAt("");
    setAddGender("");
    setAddIsExisting(null);
    setAddAge("");
    setAddSchool("");
    setAddGrade("");
    setAddError(null);
    setAddFieldErrors({});
  }, []);

  const openDirectAddModal = () => {
    resetDirectAddForm();
    setIsDirectAddOpen(true);
  };

  const closeDirectAddModal = () => {
    if (addSubmitting) return;
    setIsDirectAddOpen(false);
    resetDirectAddForm();
  };

  const loadWaitlists = useCallback(async (opts?: { silent?: boolean }) => {
    const tab = TABS.find((t) => t.id === activeTab)!;
    const silent = opts?.silent === true;
    if (!silent) {
      setLoadState("loading");
      setLoadError(null);
    }
    try {
      const baseParams =
        tab.branch === null
          ? { season: tab.season }
          : { season: tab.season, branch: tab.branch };
      const data = await fetchAdminWaitlists(
        selectedGender === "ALL"
          ? baseParams
          : { ...baseParams, gender: selectedGender }
      );
      const list = data.waitlists ?? [];
      setItems(list);
      setLoadError(null);
      setLoadState("idle");
    } catch (e) {
      if (!silent) {
        setItems([]);
        setLoadState("error");
        setLoadError(e instanceof Error ? e.message : "목록을 불러오지 못했습니다.");
      } else {
        showToast(
          e instanceof Error ? e.message : "목록을 새로고침하지 못했습니다."
        );
      }
    }
  }, [activeTab, selectedGender, showToast]);

  useEffect(() => {
    void loadWaitlists();
  }, [loadWaitlists]);

  const handleDirectAddSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setAddFieldErrors({});
    const tab = TABS.find((t) => t.id === activeTab)!;
    const variant = waitlistTableVariant(activeTab);

    if (!addName.trim()) {
      setAddError("이름을 입력해 주세요.");
      setAddFieldErrors({ name: true });
      return;
    }
    if (!addPhone.trim()) {
      setAddError("연락처를 입력해 주세요.");
      setAddFieldErrors({ phone: true });
      return;
    }
    const registeredAtTrimmed = addRegisteredAt.trim();
    if (!registeredAtTrimmed) {
      setAddError("등록 날짜를 선택해 주세요.");
      setAddFieldErrors({ registeredAt: true });
      return;
    }
    if (addGender !== "MALE" && addGender !== "FEMALE") {
      setAddError("성별을 선택해 주세요.");
      setAddFieldErrors({ gender: true });
      return;
    }
    if (addIsExisting !== true && addIsExisting !== false) {
      setAddError("기존 재원 여부를 선택해 주세요.");
      setAddFieldErrors({ isExisting: true });
      return;
    }

    if (variant === "n_branch") {
      const ageNum = parseInt(addAge.trim(), 10);
      if (Number.isNaN(ageNum) || ageNum < 1 || ageNum > 99) {
        setAddError("올바른 나이(1~99)를 입력해 주세요.");
        setAddFieldErrors({ age: true });
        return;
      }
    } else if (variant === "hi_end") {
      if (!addSchool.trim()) {
        setAddError("학교를 입력해 주세요.");
        setAddFieldErrors({ school: true });
        return;
      }
      if (!addGrade.trim()) {
        setAddError("학년을 선택해 주세요.");
        setAddFieldErrors({ grade: true });
        return;
      }
    } else {
      const ageNum = parseInt(addAge.trim(), 10);
      if (Number.isNaN(ageNum) || ageNum < 1 || ageNum > 99) {
        setAddError("올바른 나이(1~99)를 입력해 주세요.");
        setAddFieldErrors({ age: true });
        return;
      }
      if (!addSchool.trim()) {
        setAddError("학교를 입력해 주세요.");
        setAddFieldErrors({ school: true });
        return;
      }
      if (!addGrade.trim()) {
        setAddError("학년을 선택해 주세요.");
        setAddFieldErrors({ grade: true });
        return;
      }
    }

    const body = buildAdminWaitlistCreateBody(variant, tab.season, tab.branch, {
      name: addName,
      phoneNumber: addPhone,
      registeredAt: registeredAtTrimmed,
      gender: addGender,
      isExisting: addIsExisting,
      ageInput: addAge,
      school: addSchool,
      grade: addGrade,
    });

    setAddSubmitting(true);
    try {
      await createAdminWaitlist(body);
      setIsDirectAddOpen(false);
      resetDirectAddForm();
      showToast("대기 등록이 완료되었습니다.");
      await loadWaitlists({ silent: true });
    } catch (err) {
      setAddFieldErrors({});
      setAddError(err instanceof Error ? err.message : "등록에 실패했습니다.");
    } finally {
      setAddSubmitting(false);
    }
  };

  const handleStatusSelectChange = (student: Waitlist, newStatus: WaitlistStatus) => {
    if (student.status === newStatus) return;
    setSelectedStudent(student);
    setPendingStatus(newStatus);
  };

  const closeModal = () => {
    if (updatingWaitlistId !== null) return;
    setSelectedStudent(null);
    setPendingStatus(null);
  };

  const openDeleteModal = (student: Waitlist) => {
    setSelectedStudentForDelete(student);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (deletingWaitlistId !== null) return;
    setIsDeleteModalOpen(false);
    setSelectedStudentForDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedStudentForDelete) return;
    const id = selectedStudentForDelete.waitlistId;
    setDeletingWaitlistId(id);
    try {
      const data = await deleteAdminWaitlist(id);

      if (data && data.success === false) {
        alert(data.message ?? "삭제에 실패했습니다.");
        return;
      }

      showToast(
        data?.message ?? "성공적으로 삭제되었습니다."
      );
      setIsDeleteModalOpen(false);
      setSelectedStudentForDelete(null);
      await loadWaitlists({ silent: true });
    } catch (e) {
      alert(
        e instanceof Error ? e.message : "삭제 요청에 실패했습니다."
      );
    } finally {
      setDeletingWaitlistId(null);
    }
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedStudent || !pendingStatus) return;
    setUpdatingWaitlistId(selectedStudent.waitlistId);
    try {
      const data = await patchAdminWaitlistStatus(
        selectedStudent.waitlistId,
        pendingStatus
      );

      if (data && data.success === false) {
        showToast(data.message ?? "상태 변경에 실패했습니다.");
        return;
      }

      showToast(data?.message ?? "상태가 변경되었습니다.");
      setSelectedStudent(null);
      setPendingStatus(null);
      await loadWaitlists({ silent: true });
    } catch (e) {
      showToast(
        e instanceof Error ? e.message : "상태 변경 요청에 실패했습니다."
      );
    } finally {
      setUpdatingWaitlistId(null);
    }
  };

  const interactionsLocked =
    loadState === "loading" ||
    modalOpen ||
    isDeleteModalOpen ||
    updatingWaitlistId !== null ||
    deletingWaitlistId !== null ||
    isDirectAddOpen;

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
            <Users className="h-5 w-5" strokeWidth={2} aria-hidden />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">대기열 관리</h1>
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <p className="min-w-0 flex-1 text-slate-600">
            등록 대기 학생들을 조회하고 상태를 최신화합니다.
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <label
              htmlFor="waitlist-gender-filter"
              className="whitespace-nowrap text-sm font-medium text-slate-600"
            >
              성별
            </label>
            <select
              id="waitlist-gender-filter"
              value={selectedGender}
              onChange={(e) =>
                setSelectedGender(e.target.value as GenderFilter)
              }
              disabled={interactionsLocked}
              className="min-w-[8rem] cursor-pointer rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm leading-tight text-slate-800 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="ALL">전체</option>
              <option value="MALE">남성</option>
              <option value="FEMALE">여성</option>
            </select>
          </div>
        </div>
        {loadState === "loading" && (
          <div
            className="mt-4 flex min-h-[3.5rem] flex-col items-center justify-center gap-2.5"
            aria-live="polite"
            aria-busy="true"
          >
            <Loader2
              className="h-6 w-6 shrink-0 animate-spin text-slate-700"
              strokeWidth={2}
              aria-hidden
            />
            <span className="text-center text-sm font-medium text-slate-600">
              목록을 불러오는 중…
            </span>
          </div>
        )}
        {loadState === "error" && loadError && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {loadError}
          </p>
        )}
      </div>

      {/* Tab Menu */}
      <div className="mb-6 flex gap-1 rounded-lg bg-slate-100 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            disabled={interactionsLocked}
            className={`
              flex-1 min-w-0 cursor-pointer rounded-md px-4 py-2.5 text-sm font-medium
              transition-all duration-200 ease-out
              disabled:cursor-not-allowed disabled:opacity-60
              ${
                activeTab === tab.id
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-800"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div
        className={`rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-opacity duration-200 ${
          loadState === "loading" ? "min-h-[min(50vh,22rem)]" : ""
        }`}
        aria-busy={loadState === "loading"}
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                대기 순번
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                기존 재원 여부
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                이름
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                성별
              </th>
              {(tableVariant === "n_branch" || tableVariant === "camp") && (
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  나이
                </th>
              )}
              {(tableVariant === "hi_end" || tableVariant === "camp") && (
                <>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    학교
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    학년
                  </th>
                </>
              )}
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                연락처
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                신청일
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                상태 변경
              </th>
              <th className="px-6 py-4 pr-16 text-center text-sm font-semibold text-slate-700" aria-hidden />
            </tr>
          </thead>
          <tbody>
            {loadState === "loading" ? (
              <tr>
                <td colSpan={tableColSpan} className="p-0 align-middle">
                  <div className="flex min-h-[min(42vh,18rem)] flex-col items-center justify-center gap-4 px-6 py-12">
                    <Loader2
                      className="h-10 w-10 animate-spin text-slate-700"
                      strokeWidth={2}
                      aria-hidden
                    />
                    <p className="text-center text-sm font-medium text-slate-600">
                      목록을 불러오는 중…
                    </p>
                  </div>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={tableColSpan}
                  className="px-6 py-16 text-center text-sm text-slate-500"
                >
                  해당 구간에 등록된 대기자가 없습니다.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const rowBusy =
                  updatingWaitlistId === item.waitlistId ||
                  modalOpen ||
                  isDeleteModalOpen ||
                  isDirectAddOpen ||
                  deletingWaitlistId === item.waitlistId;
                return (
                  <tr
                    key={item.waitlistId}
                    className="border-b border-slate-100 last:border-0 transition-colors hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">
                      {item.waitingNumber}
                    </td>
                    <td className="px-6 py-4">
                      {item.isExisting === true ? (
                        <span
                          className="text-base font-bold text-blue-600"
                          title="기존 재원생"
                        >
                          O
                        </span>
                      ) : item.isExisting === false ? (
                        <span
                          className="text-base font-bold text-red-600"
                          title="신규생"
                        >
                          X
                        </span>
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-800">{item.name}</td>
                    <td className="px-6 py-4">{formatGenderLabel(item.gender)}</td>
                    {(tableVariant === "n_branch" || tableVariant === "camp") && (
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {item.age != null ? item.age : "—"}
                      </td>
                    )}
                    {(tableVariant === "hi_end" || tableVariant === "camp") && (
                      <>
                        <td className="px-6 py-4">
                          {formatWaitlistCell(item.student_school)}
                        </td>
                        <td className="px-6 py-4">
                          {formatWaitlistCell(item.student_grade)}
                        </td>
                      </>
                    )}
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatPhoneDisplay(item.phoneNumber)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatRegisteredAt(item.registeredAt)}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={item.status}
                        disabled={rowBusy}
                        onChange={(e) =>
                          handleStatusSelectChange(
                            item,
                            e.target.value as WaitlistStatus
                          )
                        }
                        className={`
                        min-w-[120px] max-w-[140px] rounded-lg border px-3 py-2 text-sm font-medium
                        cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-300
                        disabled:cursor-not-allowed disabled:opacity-60
                        ${STATUS_STYLES[item.status].bg}
                        ${STATUS_STYLES[item.status].text}
                        ${STATUS_STYLES[item.status].border}
                      `}
                        aria-label={`${item.name} 상태`}
                        aria-busy={rowBusy}
                      >
                        {(Object.keys(STATUS_LABELS) as WaitlistStatus[]).map((status) => (
                          <option key={status} value={status}>
                            {STATUS_LABELS[status]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 pr-16 text-center">
                      <button
                        type="button"
                        onClick={() => openDeleteModal(item)}
                        disabled={rowBusy}
                        className="mx-auto flex w-fit cursor-pointer flex-row items-center gap-1.5 whitespace-nowrap rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label={`${item.name} 대기 등록 삭제`}
                      >
                        <Trash2
                          className="h-[1.125rem] w-[1.125rem] shrink-0"
                          strokeWidth={2}
                          aria-hidden
                        />
                        삭제
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-center">
        <button
          type="button"
          onClick={openDirectAddModal}
          disabled={interactionsLocked}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-50 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus className="h-4 w-4 shrink-0 text-slate-900" strokeWidth={2} aria-hidden />
          직접 추가
        </button>
      </div>

      {isDirectAddOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-[logo-transition-fade-in_0.25s_ease-out]"
          onClick={closeDirectAddModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="waitlist-direct-add-modal-title"
        >
          <div
            className="max-h-[min(90vh,40rem)] w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl animate-[confirm-modal-appear_0.6s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2
                id="waitlist-direct-add-modal-title"
                className="text-lg font-bold text-slate-900"
              >
                관리자 대기 학생 직접 추가
              </h2>
              <button
                type="button"
                onClick={closeDirectAddModal}
                disabled={addSubmitting}
                className="cursor-pointer rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="닫기"
              >
                <X className="h-5 w-5" strokeWidth={2} aria-hidden />
              </button>
            </div>
            <form
              noValidate
              onSubmit={(e) => void handleDirectAddSubmit(e)}
              className="max-h-[min(75vh,34rem)] space-y-4 overflow-y-auto px-6 py-5"
            >
              <div>
                <label
                  htmlFor="direct-add-name"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  이름
                </label>
                <input
                  id="direct-add-name"
                  type="text"
                  value={addName}
                  onChange={(e) => {
                    setAddName(e.target.value);
                    setAddFieldErrors((p) => ({ ...p, name: false }));
                  }}
                  autoComplete="name"
                  className={directAddInputClass(!!addFieldErrors.name)}
                  disabled={addSubmitting}
                />
              </div>
              <div>
                <label
                  htmlFor="direct-add-phone"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  연락처
                </label>
                <input
                  id="direct-add-phone"
                  type="tel"
                  inputMode="tel"
                  value={addPhone}
                  onChange={(e) => {
                    setAddPhone(e.target.value);
                    setAddFieldErrors((p) => ({ ...p, phone: false }));
                  }}
                  autoComplete="tel"
                  className={directAddInputClass(!!addFieldErrors.phone)}
                  disabled={addSubmitting}
                />
              </div>
              <div>
                <label
                  htmlFor="direct-add-registered-at"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  등록 날짜
                </label>
                <input
                  id="direct-add-registered-at"
                  type="date"
                  value={addRegisteredAt}
                  onChange={(e) => {
                    setAddRegisteredAt(e.target.value);
                    setAddFieldErrors((p) => ({ ...p, registeredAt: false }));
                  }}
                  className={`${directAddInputClass(!!addFieldErrors.registeredAt)} cursor-pointer disabled:cursor-not-allowed ${!addRegisteredAt ? "direct-add-date-empty" : ""}`}
                  disabled={addSubmitting}
                  aria-required
                />
              </div>
              <div>
                <label
                  htmlFor="direct-add-gender"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  성별
                </label>
                <select
                  id="direct-add-gender"
                  value={addGender}
                  onChange={(e) => {
                    setAddGender(e.target.value as "" | WaitlistGender);
                    setAddFieldErrors((p) => ({ ...p, gender: false }));
                  }}
                  disabled={addSubmitting}
                  className={directAddSelectClass(!!addFieldErrors.gender)}
                >
                  <option value="" disabled hidden />
                  <option value="MALE">남성</option>
                  <option value="FEMALE">여성</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="direct-add-is-existing"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  기존 재원 여부
                </label>
                <select
                  id="direct-add-is-existing"
                  value={
                    addIsExisting === true
                      ? "true"
                      : addIsExisting === false
                        ? "false"
                        : ""
                  }
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "") setAddIsExisting(null);
                    else setAddIsExisting(v === "true");
                    setAddFieldErrors((p) => ({ ...p, isExisting: false }));
                  }}
                  disabled={addSubmitting}
                  className={directAddSelectClass(!!addFieldErrors.isExisting)}
                >
                  <option value="" disabled hidden />
                  <option value="true">O (기존 재원생)</option>
                  <option value="false">X (신규 학생)</option>
                </select>
              </div>

              {tableVariant === "n_branch" && (
                <div>
                  <label
                    htmlFor="direct-add-age"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    나이
                  </label>
                  <input
                    id="direct-add-age"
                    type="number"
                    min={1}
                    max={99}
                    value={addAge}
                    onChange={(e) => {
                      setAddAge(e.target.value);
                      setAddFieldErrors((p) => ({ ...p, age: false }));
                    }}
                    className={directAddInputClass(!!addFieldErrors.age)}
                    disabled={addSubmitting}
                  />
                </div>
              )}

              {tableVariant === "hi_end" && (
                <>
                  <div>
                    <label
                      htmlFor="direct-add-school"
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      학교
                    </label>
                    <input
                      id="direct-add-school"
                      type="text"
                      value={addSchool}
                      onChange={(e) => {
                        setAddSchool(e.target.value);
                        setAddFieldErrors((p) => ({ ...p, school: false }));
                      }}
                      className={directAddInputClass(!!addFieldErrors.school)}
                      disabled={addSubmitting}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="direct-add-grade"
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      학년
                    </label>
                    <select
                      id="direct-add-grade"
                      value={addGrade}
                      onChange={(e) => {
                        setAddGrade(e.target.value);
                        setAddFieldErrors((p) => ({ ...p, grade: false }));
                      }}
                      disabled={addSubmitting}
                      className={directAddSelectClass(!!addFieldErrors.grade)}
                    >
                      <option value="" disabled hidden />
                      <option value="2학년">2학년</option>
                      <option value="3학년">3학년</option>
                    </select>
                  </div>
                </>
              )}

              {tableVariant === "camp" && (
                <>
                  <div>
                    <label
                      htmlFor="direct-add-age-camp"
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      나이
                    </label>
                    <input
                      id="direct-add-age-camp"
                      type="number"
                      min={1}
                      max={99}
                      value={addAge}
                      onChange={(e) => {
                        setAddAge(e.target.value);
                        setAddFieldErrors((p) => ({ ...p, age: false }));
                      }}
                      className={directAddInputClass(!!addFieldErrors.age)}
                      disabled={addSubmitting}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="direct-add-school-camp"
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      학교
                    </label>
                    <input
                      id="direct-add-school-camp"
                      type="text"
                      value={addSchool}
                      onChange={(e) => {
                        setAddSchool(e.target.value);
                        setAddFieldErrors((p) => ({ ...p, school: false }));
                      }}
                      className={directAddInputClass(!!addFieldErrors.school)}
                      disabled={addSubmitting}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="direct-add-grade-camp"
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      학년
                    </label>
                    <select
                      id="direct-add-grade-camp"
                      value={addGrade}
                      onChange={(e) => {
                        setAddGrade(e.target.value);
                        setAddFieldErrors((p) => ({ ...p, grade: false }));
                      }}
                      disabled={addSubmitting}
                      className={directAddSelectClass(!!addFieldErrors.grade)}
                    >
                      <option value="" disabled hidden />
                      <option value="2학년">2학년</option>
                      <option value="3학년">3학년</option>
                    </select>
                  </div>
                </>
              )}

              {addError && (
                <p className="text-sm text-red-600" role="alert">
                  {addError}
                </p>
              )}

              <div className="flex gap-3 border-t border-slate-100 pt-4">
                <button
                  type="submit"
                  disabled={addSubmitting}
                  className="flex-1 cursor-pointer rounded-xl bg-slate-800 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {addSubmitting ? "등록 중…" : "등록"}
                </button>
                <button
                  type="button"
                  onClick={closeDirectAddModal}
                  disabled={addSubmitting}
                  className="flex-1 cursor-pointer rounded-xl bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedStudent && pendingStatus && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-[logo-transition-fade-in_0.25s_ease-out]"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="waitlist-status-modal-title"
        >
          <div
            className="mx-4 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl animate-[confirm-modal-appear_0.6s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 p-3 text-blue-500">
              <Bell className="h-6 w-6" strokeWidth={2} aria-hidden />
            </div>
            <h2
              id="waitlist-status-modal-title"
              className="mt-4 text-center text-xl font-bold text-gray-900"
            >
              등록 상태 변경 확인
            </h2>
            <p className="mt-3 text-center text-slate-600">
              정말{" "}
              <span className="font-semibold text-blue-600">
                {selectedStudent.name}
              </span>{" "}
              학생의 대기 상태를{" "}
              <span className="font-semibold text-blue-600">
                {STATUS_LABELS[pendingStatus]}
              </span>
              로 변경하시겠습니까?
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600">
              변경 시 학생에게 안내 문자가 자동 발송됩니다.
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => void handleConfirmStatusChange()}
                disabled={updatingWaitlistId !== null}
                className="flex-1 cursor-pointer rounded-xl bg-slate-800 px-4 py-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-slate-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updatingWaitlistId !== null ? "처리 중…" : "확인"}
              </button>
              <button
                type="button"
                onClick={closeModal}
                disabled={updatingWaitlistId !== null}
                className="flex-1 cursor-pointer rounded-xl bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && selectedStudentForDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-[logo-transition-fade-in_0.25s_ease-out]"
          onClick={closeDeleteModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="waitlist-delete-modal-title"
        >
          <div
            className="mx-4 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl animate-[confirm-modal-appear_0.6s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 p-3 text-blue-500">
              <Trash2 className="h-6 w-6" strokeWidth={2} aria-hidden />
            </div>
            <h2
              id="waitlist-delete-modal-title"
              className="mt-4 text-center text-xl font-bold text-gray-900"
            >
              대기 등록 삭제 확인
            </h2>
            <p className="mt-3 text-center text-slate-600">
              정말{" "}
              <span className="font-semibold text-blue-600">
                {selectedStudentForDelete.name}
              </span>{" "}
              학생의 대기 등록을 삭제하시겠습니까?
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => void handleConfirmDelete()}
                disabled={deletingWaitlistId !== null}
                className="flex-1 cursor-pointer rounded-xl bg-slate-800 px-4 py-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-slate-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingWaitlistId !== null ? "처리 중…" : "확인"}
              </button>
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deletingWaitlistId !== null}
                className="flex-1 cursor-pointer rounded-xl bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {(toastMessage || toastExiting) && (
        <div
          className={`fixed bottom-5 right-5 z-[60] rounded-lg bg-slate-800 px-5 py-3.5 text-sm font-medium text-white shadow-lg ${
            toastExiting
              ? "translate-x-4 opacity-0 pointer-events-none transition-all duration-700 ease-out"
              : "animate-[toast-slide-in_0.5s_ease-out]"
          }`}
          role="status"
          aria-live="polite"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
