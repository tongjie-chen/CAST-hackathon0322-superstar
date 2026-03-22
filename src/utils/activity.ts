export type ActivityType = 'assessment' | 'interview' | 'roadmap' | 'simulator' | 'exploration' | 'coverletter' | 'salary';

export interface Activity {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: ActivityType;
}

export const logActivity = (activity: Omit<Activity, 'id' | 'time'>) => {
  try {
    const activities: Activity[] = JSON.parse(localStorage.getItem('userActivities') || '[]');
    const newActivity: Activity = {
      ...activity,
      id: Math.random().toString(36).substr(2, 9),
      time: new Date().toISOString()
    };
    activities.unshift(newActivity);
    localStorage.setItem('userActivities', JSON.stringify(activities.slice(0, 50)));
    window.dispatchEvent(new Event('activityUpdated'));
  } catch (e) {
    console.error('Failed to log activity', e);
  }
};

export const getActivities = (): Activity[] => {
  try {
    return JSON.parse(localStorage.getItem('userActivities') || '[]');
  } catch (e) {
    return [];
  }
};

export const clearActivities = () => {
  localStorage.removeItem('userActivities');
  window.dispatchEvent(new Event('activityUpdated'));
};
