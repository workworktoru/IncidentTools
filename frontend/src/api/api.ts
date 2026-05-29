import axios from 'axios';
import type { Incident, ConfigurationItem, User, Team, Problem, Change, Release } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const teamApi = {
  list: () => api.get<Team[]>('/teams/').then(res => res.data),
  create: (data: Partial<Team>) => api.post<Team>('/teams/', data).then(res => res.data),
};

export const userApi = {
  list: () => api.get<User[]>('/users/').then(res => res.data),
  create: (data: Partial<User>) => api.post<User>('/users/', data).then(res => res.data),
};

export const incidentApi = {
  list: () => api.get<Incident[]>('/incidents/').then(res => res.data),
  get: (id: string) => api.get<Incident>(`/incidents/${id}`).then(res => res.data),
  create: (data: Partial<Incident>) => api.post<Incident>('/incidents/', data).then(res => res.data),
  update: (id: string, data: Partial<Incident>) => api.put<Incident>(`/incidents/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/incidents/${id}`).then(res => res.data),
  search: (query: string) => api.get<Incident[]>(`/incidents/search/`, { params: { query } }).then(res => res.data),
};

export const problemApi = {
  list: () => api.get<Problem[]>('/problems/').then(res => res.data),
  get: (id: string) => api.get<Problem>(`/problems/${id}`).then(res => res.data),
  create: (data: Partial<Problem>) => api.post<Problem>('/problems/', data).then(res => res.data),
  update: (id: string, data: Partial<Problem>) => api.put<Problem>(`/problems/${id}`, data).then(res => res.data),
};

export const changeApi = {
  list: () => api.get<Change[]>('/changes/').then(res => res.data),
  get: (id: string) => api.get<Change>(`/changes/${id}`).then(res => res.data),
  create: (data: Partial<Change>) => api.post<Change>('/changes/', data).then(res => res.data),
  update: (id: string, data: Partial<Change>) => api.put<Change>(`/changes/${id}`, data).then(res => res.data),
};

export const releaseApi = {
  list: () => api.get<Release[]>('/releases/').then(res => res.data),
  get: (id: string) => api.get<Release>(`/releases/${id}`).then(res => res.data),
  create: (data: Partial<Release>) => api.post<Release>('/releases/', data).then(res => res.data),
  update: (id: string, data: Partial<Release>) => api.put<Release>(`/releases/${id}`, data).then(res => res.data),
};

export const ciApi = {
  list: () => api.get<ConfigurationItem[]>('/configuration-items/').then(res => res.data),
  get: (id: string) => api.get<ConfigurationItem>(`/configuration-items/${id}`).then(res => res.data),
  create: (data: Partial<ConfigurationItem>) => api.post<ConfigurationItem>('/configuration-items/', data).then(res => res.data),
  update: (id: string, data: Partial<ConfigurationItem>) => api.put<ConfigurationItem>(`/configuration-items/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/configuration-items/${id}`).then(res => res.data),
};

export default api;
