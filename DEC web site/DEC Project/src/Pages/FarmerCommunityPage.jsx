import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FaComments,
  FaLeaf,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaSearch,
  FaShieldAlt,
  FaSyncAlt,
  FaUserCheck,
  FaUsers
} from 'react-icons/fa';
import { API_BASES } from '../config/api';

const STATUS_META = {
  online: {
    dotClass: 'bg-emerald-500',
    badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    label: 'Online now'
  },
  away: {
    dotClass: 'bg-amber-400',
    badgeClass: 'border-amber-200 bg-amber-50 text-amber-700',
    label: 'Recently active'
  },
  offline: {
    dotClass: 'bg-slate-400',
    badgeClass: 'border-slate-200 bg-slate-100 text-slate-600',
    label: 'Offline'
  }
};

const getStatusMeta = (status) => STATUS_META[status] || STATUS_META.offline;

const getInitials = (name = 'Farmer') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'F';

const formatMessageTime = (value) => {
  if (!value) return 'Now';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Now';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const normalizeMessage = (message, currentUserId) => ({
  id: message.id,
  senderId: Number(message.sender_id),
  receiverId: Number(message.receiver_id),
  senderName: message.sender_name || 'Farmer',
  body: message.message || '',
  createdAt: message.created_at,
  isOwn: Number(message.sender_id) === Number(currentUserId)
});

const FarmerAvatar = ({
  avatar,
  name,
  sizeClass = 'h-12 w-12',
  textClass = 'text-sm'
}) => {
  const [hasImageError, setHasImageError] = useState(false);

  if (avatar && !hasImageError) {
    return (
      <img
        src={avatar}
        alt={name}
        className={`${sizeClass} rounded-2xl object-cover shadow-sm`}
        onError={() => setHasImageError(true)}
      />
    );
  }

  return (
    <div
      className={`flex ${sizeClass} items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 text-white shadow-sm`}
    >
      <span className={`font-bold ${textClass}`}>{getInitials(name)}</span>
    </div>
  );
};

const FarmerCommunityPage = ({ user }) => {
  const currentUserId = Number(user?.id || user?.userId || 0);
  const communityToken = localStorage.getItem('token');
  const messagesEndRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [communityMembers, setCommunityMembers] = useState([]);
  const [selectedFarmerId, setSelectedFarmerId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [communityError, setCommunityError] = useState('');
  const [conversationError, setConversationError] = useState('');
  const [lastSyncedAt, setLastSyncedAt] = useState('');

  const hasAuthContext = Boolean(communityToken && currentUserId);

  const loadCommunityMembers = useCallback(
    async ({ silent = false } = {}) => {
      if (!hasAuthContext) {
        if (!silent) setIsLoadingMembers(false);
        return;
      }

      if (!silent) setIsLoadingMembers(true);

      try {
        const response = await fetch(`${API_BASES.auth}/farmer-community/users`, {
          headers: {
            Authorization: `Bearer ${communityToken}`
          }
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load registered farmers');
        }

        const farmers = Array.isArray(data.farmers)
          ? data.farmers.filter((farmer) => farmer?.role === 'farmer')
          : [];

        setCommunityMembers(farmers);
        setCommunityError('');
        setLastSyncedAt(new Date().toISOString());

        setSelectedFarmerId((currentSelected) => {
          const otherFarmers = farmers.filter(
            (farmer) => Number(farmer.id) !== Number(currentUserId)
          );

          if (!otherFarmers.length) return null;

          const selectionStillExists = otherFarmers.some(
            (farmer) => Number(farmer.id) === Number(currentSelected)
          );

          return selectionStillExists ? currentSelected : otherFarmers[0].id;
        });
      } catch (error) {
        setCommunityError(error.message || 'Failed to load the farmer community');

        if (!silent) {
          setCommunityMembers([]);
          setSelectedFarmerId(null);
        }
      } finally {
        if (!silent) setIsLoadingMembers(false);
      }
    },
    [communityToken, currentUserId, hasAuthContext]
  );

  const loadConversation = useCallback(
    async (farmerId, { silent = false } = {}) => {
      if (!hasAuthContext || !farmerId) {
        setMessages([]);
        setIsLoadingMessages(false);
        return;
      }

      if (!silent) setIsLoadingMessages(true);

      try {
        const response = await fetch(
          `${API_BASES.auth}/farmer-community/messages/${farmerId}`,
          {
            headers: {
              Authorization: `Bearer ${communityToken}`
            }
          }
        );
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load community messages');
        }

        const loadedMessages = Array.isArray(data.messages)
          ? data.messages.map((message) => normalizeMessage(message, currentUserId))
          : [];

        setMessages(loadedMessages);
        setConversationError('');
      } catch (error) {
        setConversationError(error.message || 'Failed to load the conversation');

        if (!silent) {
          setMessages([]);
        }
      } finally {
        if (!silent) setIsLoadingMessages(false);
      }
    },
    [communityToken, currentUserId, hasAuthContext]
  );

  const refreshCommunity = useCallback(async () => {
    await loadCommunityMembers();
    if (selectedFarmerId) {
      await loadConversation(selectedFarmerId, { silent: true });
    }
  }, [loadCommunityMembers, loadConversation, selectedFarmerId]);

  useEffect(() => {
    if (!hasAuthContext) {
      setCommunityError('Please log in again to open the farmer community.');
      setIsLoadingMembers(false);
      return undefined;
    }

    loadCommunityMembers();

    const intervalId = window.setInterval(() => {
      loadCommunityMembers({ silent: true });
    }, 20000);

    return () => window.clearInterval(intervalId);
  }, [hasAuthContext, loadCommunityMembers]);

  useEffect(() => {
    if (!selectedFarmerId) {
      setMessages([]);
      setConversationError('');
      return undefined;
    }

    loadConversation(selectedFarmerId);

    const intervalId = window.setInterval(() => {
      loadConversation(selectedFarmerId, { silent: true });
    }, 8000);

    return () => window.clearInterval(intervalId);
  }, [loadConversation, selectedFarmerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const registeredFarmers = useMemo(
    () => communityMembers.filter((farmer) => farmer.joinedCommunity),
    [communityMembers]
  );

  const chatFarmers = useMemo(
    () =>
      registeredFarmers.filter((farmer) => Number(farmer.id) !== Number(currentUserId)),
    [currentUserId, registeredFarmers]
  );

  const filteredFarmers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const statusRank = { online: 0, away: 1, offline: 2 };

    const sortedFarmers = [...chatFarmers].sort((farmerA, farmerB) => {
      const rankA = statusRank[farmerA.status] ?? 2;
      const rankB = statusRank[farmerB.status] ?? 2;

      if (rankA !== rankB) {
        return rankA - rankB;
      }

      return farmerA.name.localeCompare(farmerB.name);
    });

    if (!normalizedQuery) return sortedFarmers;

    return sortedFarmers.filter((farmer) => {
      const haystack = [
        farmer.name,
        farmer.specialty,
        farmer.location,
        farmer.email,
        farmer.phone
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [chatFarmers, searchQuery]);

  const selectedFarmer =
    chatFarmers.find((farmer) => Number(farmer.id) === Number(selectedFarmerId)) ||
    chatFarmers[0] ||
    null;

  const onlineFarmersCount = chatFarmers.filter((farmer) => farmer.status === 'online').length;

  const handleSendMessage = async () => {
    const trimmedMessage = messageInput.trim();

    if (!selectedFarmer || !trimmedMessage || isSending || !hasAuthContext) {
      return;
    }

    setIsSending(true);
    setConversationError('');

    try {
      const response = await fetch(`${API_BASES.auth}/farmer-community/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${communityToken}`
        },
        body: JSON.stringify({
          receiverId: selectedFarmer.id,
          message: trimmedMessage
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send the community message');
      }

      setMessageInput('');

      await Promise.all([
        loadConversation(selectedFarmer.id, { silent: true }),
        loadCommunityMembers({ silent: true })
      ]);
    } catch (error) {
      setConversationError(error.message || 'Unable to send your message right now');
    } finally {
      setIsSending(false);
    }
  };

  const handleMessageKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  if (!hasAuthContext) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_20px_50px_-34px_rgba(15,23,42,0.45)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600">
          <FaUsers className="text-2xl" />
        </div>
        <h2 className="mt-5 text-center text-2xl font-bold text-slate-900">
          Farmer community is unavailable
        </h2>
        <p className="mt-3 text-center text-sm leading-7 text-slate-500">
          Please sign in again so we can load registered farmer accounts and their conversations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,_rgba(255,255,255,0.98)_0%,_rgba(240,253,250,0.98)_54%,_rgba(236,253,245,0.95)_100%)] p-6 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.45)] lg:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
              <FaShieldAlt className="text-xs" />
              Registered farmers only
            </div>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl">
              Farmer Community
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 lg:text-base">
              Every registered farmer account is added here automatically. Only farmer users can
              open this page, find other farmers, and communicate directly inside the panel.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-slate-200 bg-white px-4 py-4 text-center shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Registered
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {registeredFarmers.length}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200 bg-white px-4 py-4 text-center shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Ready To Chat
              </p>
              <p className="mt-2 text-2xl font-bold text-emerald-600">{chatFarmers.length}</p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200 bg-white px-4 py-4 text-center shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Online Now
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{onlineFarmersCount}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_50px_-34px_rgba(15,23,42,0.45)]">
          <div className="border-b border-slate-100 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-600">
                  <FaUsers />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Auto-joined farmers</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Registered farmer users appear here automatically.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={refreshCommunity}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700"
              >
                <FaSyncAlt className="text-[11px]" />
                Refresh
              </button>
            </div>

            <div className="relative mt-5">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search registered farmers..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <div className="mt-4 rounded-[1.25rem] bg-slate-50 px-4 py-3 text-xs leading-6 text-slate-500">
              Only accounts with the farmer role can use this community.
              <span className="ml-1 font-semibold text-slate-700">
                Last sync: {formatMessageTime(lastSyncedAt)}
              </span>
            </div>

            {communityError ? (
              <div className="mt-4 rounded-[1.25rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {communityError}
              </div>
            ) : null}
          </div>

          <div className="max-h-[720px] overflow-y-auto p-3">
            {isLoadingMembers && !chatFarmers.length ? (
              <div className="space-y-3 p-2">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="animate-pulse rounded-[1.5rem] border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-slate-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-2/3 rounded-full bg-slate-200" />
                        <div className="h-3 w-1/2 rounded-full bg-slate-200" />
                        <div className="h-3 w-5/6 rounded-full bg-slate-200" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredFarmers.length ? (
              filteredFarmers.map((farmer) => {
                const statusMeta = getStatusMeta(farmer.status);

                return (
                  <button
                    key={farmer.id}
                    type="button"
                    onClick={() => setSelectedFarmerId(farmer.id)}
                    className={`mb-2 w-full rounded-[1.5rem] border p-3 text-left transition ${
                      Number(selectedFarmer?.id) === Number(farmer.id)
                        ? 'border-emerald-200 bg-emerald-50 shadow-sm'
                        : 'border-transparent bg-white hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative shrink-0">
                        <FarmerAvatar avatar={farmer.avatar} name={farmer.name} />
                        <span
                          className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${statusMeta.dotClass}`}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-bold text-slate-900">{farmer.name}</p>
                          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-emerald-700 shadow-sm">
                            <FaUserCheck className="text-[9px]" />
                            Auto joined
                          </span>
                        </div>

                        <p className="mt-1 truncate text-xs text-slate-500">
                          {farmer.specialty} - {farmer.location}
                        </p>
                        <p className="mt-2 truncate text-xs text-slate-400">
                          {farmer.lastMessage}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100 text-slate-500">
                  <FaSearch />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">No farmers found</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Try a different search or wait for more registered farmers to appear here.
                </p>
              </div>
            )}
          </div>
        </aside>

        <section className="rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_50px_-34px_rgba(15,23,42,0.45)]">
          {selectedFarmer ? (
            <div className="flex h-full flex-col">
              <div className="border-b border-slate-100 p-5 lg:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      <FarmerAvatar
                        avatar={selectedFarmer.avatar}
                        name={selectedFarmer.name}
                        sizeClass="h-16 w-16"
                        textClass="text-base"
                      />
                      <span
                        className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${getStatusMeta(selectedFarmer.status).dotClass}`}
                      />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-bold text-slate-900">
                          {selectedFarmer.name}
                        </h2>
                        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
                          <FaUserCheck className="text-[10px]" />
                          Registered farmer
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                        <span>{selectedFarmer.specialty}</span>
                        <span className="inline-flex items-center gap-1">
                          <FaMapMarkerAlt className="text-emerald-500" />
                          {selectedFarmer.location}
                        </span>
                      </div>

                      {selectedFarmer.bio ? (
                        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                          {selectedFarmer.bio}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${getStatusMeta(selectedFarmer.status).badgeClass}`}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${getStatusMeta(selectedFarmer.status).dotClass}`}
                    />
                    {getStatusMeta(selectedFarmer.status).label}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 border-b border-slate-100 p-5 lg:grid-cols-3 lg:p-6">
                <div className="rounded-[1.5rem] bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-700">
                    <FaUsers className="text-emerald-500" />
                    <span className="text-sm font-semibold">Auto joined</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    This farmer became part of the community automatically after registering as a
                    farmer user.
                  </p>
                </div>

                <div className="rounded-[1.5rem] bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-700">
                    <FaShieldAlt className="text-emerald-500" />
                    <span className="text-sm font-semibold">Farmer-only access</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Only farmer accounts can see these conversations and communicate with each
                    other here.
                  </p>
                </div>

                <div className="rounded-[1.5rem] bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-700">
                    <FaLeaf className="text-emerald-500" />
                    <span className="text-sm font-semibold">Smart collaboration</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Use this space to discuss pricing, stock movement, crop advice, transport, and
                    seasonal planning.
                  </p>
                </div>
              </div>

              {conversationError ? (
                <div className="mx-5 mt-5 rounded-[1.25rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 lg:mx-6">
                  {conversationError}
                </div>
              ) : null}

              <div className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,_rgba(248,250,252,0.6)_0%,_rgba(255,255,255,1)_14%)] p-5 lg:p-6">
                {isLoadingMessages ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className={`flex ${item % 2 === 0 ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="w-full max-w-xl animate-pulse rounded-[1.5rem] bg-slate-100 px-4 py-4">
                          <div className="h-3 w-1/3 rounded-full bg-slate-200" />
                          <div className="mt-3 h-3 w-full rounded-full bg-slate-200" />
                          <div className="mt-2 h-3 w-2/3 rounded-full bg-slate-200" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : messages.length ? (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-2xl rounded-[1.5rem] px-4 py-3 shadow-sm ${
                            message.isOwn
                              ? 'bg-slate-900 text-white'
                              : 'border border-slate-200 bg-white text-slate-800'
                          }`}
                        >
                          {!message.isOwn ? (
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600">
                              {message.senderName}
                            </p>
                          ) : null}

                          <p
                            className={`mt-1 text-sm leading-7 ${
                              message.isOwn ? 'text-white' : 'text-slate-700'
                            }`}
                          >
                            {message.body}
                          </p>

                          <p
                            className={`mt-2 text-xs ${
                              message.isOwn ? 'text-slate-300' : 'text-slate-400'
                            }`}
                          >
                            {formatMessageTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="flex h-full min-h-[280px] items-center justify-center">
                    <div className="max-w-md text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600">
                        <FaComments className="text-2xl" />
                      </div>
                      <h3 className="mt-5 text-xl font-bold text-slate-900">
                        Start the first conversation
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-slate-500">
                        This registered farmer is already part of the community. Send a message to
                        start farmer-to-farmer communication.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 p-5 lg:p-6">
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-3">
                  <div className="flex flex-col gap-3 lg:flex-row">
                    <textarea
                      rows="2"
                      value={messageInput}
                      onChange={(event) => setMessageInput(event.target.value)}
                      onKeyDown={handleMessageKeyDown}
                      placeholder={`Message ${selectedFarmer.name} in the farmer community...`}
                      className="min-h-[64px] flex-1 resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                    />

                    <button
                      type="button"
                      onClick={handleSendMessage}
                      disabled={isSending || !messageInput.trim()}
                      className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      <FaPaperPlane className="text-xs" />
                      {isSending ? 'Sending...' : 'Send Message'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[560px] items-center justify-center p-10 text-center">
              <div className="max-w-lg">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-500">
                  <FaUsers className="text-2xl" />
                </div>
                <h2 className="mt-5 text-2xl font-bold text-slate-900">
                  No other registered farmers yet
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-500">
                  When more farmer users register, they will be added to this community
                  automatically and appear here for direct communication.
                </p>
              </div>
            </div>
          )}
        </section>
      </section>
    </div>
  );
};

export default FarmerCommunityPage;
