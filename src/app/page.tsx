'use client';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/redux/store';
import { increment } from '@/redux/features/userSlice';

const App = () => {
  const dispatch: AppDispatch = useDispatch();
  const { user, loading, error } = useSelector((state: RootState) => state.user);

  return (
    <main>
      <div>
        Loading is {loading.toString()}
      </div>
      <button
        onClick={() => dispatch(increment())}
      > Change </button>
    </main>
  );
};

export default App;
