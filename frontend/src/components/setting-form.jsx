import React, { useEffect, useState, Fragment } from 'react';
import useStore from '../store';
import { useForm } from 'react-hook-form';
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions, ComboboxButton, Transition } from '@headlessui/react';
import { fetchCountries } from '../libs';
import { BsChevronExpand } from 'react-icons/bs';
import Input from './ui/input';
import { Button } from './ui/button';
import api from '../libs/apiCall';
import { BiLoader, BiCheck } from 'react-icons/bi';
import { toast } from 'sonner';

const SettingsForm = () => {
  const { user, theme, setTheme } = useStore((state) => state);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { ...user },
  });

  const [selectedCountry, setSelectedCountry] = useState({
    country: user?.country || "",
    currency: user?.currency || "",
  });
  const [query, setQuery] = useState("");
  const [countriesData, setCountriesData] = useState([]);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (values) => {
    try {
      setLoading(true);
      const newData = {
        ...values,
        country: selectedCountry.country,
        currency: selectedCountry.currency,
      };
      const { data: res } = await api.put(`/user`, newData);

      if (res?.user) {
        const newUser = { ...res.user, token: user.token };
        localStorage.setItem("user", JSON.stringify(newUser));
        toast.success(res?.message);
      }
    } catch (error) {
      console.error("Something went wrong: ", error);
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = (val) => {
    setTheme(val);
    localStorage.setItem("theme", val);
  };

  const filteredCountries = query === ""
    ? countriesData
    : countriesData.filter((country) =>
        country.country.toLowerCase().includes(query.toLowerCase())
      );

  const getCountriesList = async () => {
    const data = await fetchCountries();
    setCountriesData(data);
  };

  useEffect(() => {
    getCountriesList();
  }, []);

  const Countries = () => {
    const [isOpen, setIsOpen] = useState(false); 
  
    return (
      <div className='w-full'>
        <Combobox value={selectedCountry} onChange={(value) => {
          setSelectedCountry(value);
          setIsOpen(false); 
        }}>
          <div className='relative mt-1'>
            <div>
                <ComboboxInput
                    className='inputStyles'
                    displayValue={(country) => country?.country || ""}
                    onChange={(e) => {
                        console.log("Typing:", e.target.value);
                        setQuery(e.target.value);
                        setIsOpen(true); 
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Search for a country..."
                />
              <ComboboxButton
                className='absolute inset-y-0 right-0 flex items-center pr-2'
                onClick={() => setIsOpen((prev) => !prev)} 
              >
                <BsChevronExpand className='text-gray-400' />
              </ComboboxButton>
            </div>
  
            <Transition
              as={Fragment}
              show={isOpen}
              leave='transition ease-in duration-100'
              leaveFrom='opacity-100'
              leaveTo='opacity-0'
              afterLeave={() => setQuery("")}
            >
              <ComboboxOptions className='absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-slate-900 py-2 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm'>
                {filteredCountries.length === 0 && query !== "" ? (
                  <div className='relative cursor-default select-none px-4 py-2 text-gray-700 dark:text-gray-500'>
                    No countries found.
                  </div>
                ) : (
                  filteredCountries.map((country, index) => (
                    <ComboboxOption
                      key={country.country + index}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active ? "bg-violet-600/20 text-white" : "text-gray-900"
                        }`
                      }
                      value={country}
                    >
                      {({ selected, active }) => (
                        <>
                          <div className='flex items-center gap-2'>
                            <img
                              src={country.flag}
                              alt={country.country}
                              className='w-8 h-5 rounded-sm object-cover'
                            />
                            <span
                              className={`block truncate ${
                                selected ? "font-medium" : "font-normal"
                              }`}
                            >
                              {country.country}
                            </span>
                          </div>
                          {selected && (
                            <span
                              className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                active ? "text-white" : "text-teal-600"
                              }`}
                            >
                              <BiCheck className='h-5 w-5' aria-hidden='true' />
                            </span>
                          )}
                        </>
                      )}
                    </ComboboxOption>
                  ))
                )}
              </ComboboxOptions>
            </Transition>
          </div>
        </Combobox>
      </div>
    );
  };
  

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-5 w-full'>
      <div className='flex flex-col md:flex-row items-center justify-between gap-4'>
        <Input
          disabled={loading}
          id="firstname"
          label="First Name"
          type="text"
          placeholder="John"
          error={errors.firstname?.message}
          {...register("firstname")}
          className="inputStyle"
        />
        <Input
          disabled={loading}
          id="lastname"
          label="Last Name"
          type="text"
          placeholder="Doe"
          error={errors.lastname?.message}
          {...register("lastname")}
          className="inputStyle"
        />
      </div>

      <div className='flex flex-col md:flex-row items-center justify-between gap-4'>
        <Input
          disabled={loading}
          id="email"
          label="Email"
          type="email"
          placeholder="john@example.com"
          error={errors.email?.message}
          {...register("email", { required: "Email is required!" })}
          className="inputStyle"
        />
        <Input
          disabled={loading}
          id="contact"
          label="Contact"
          type="text"
          placeholder="0123456789"
          error={errors.contact?.message}
          {...register("contact", { required: "Contact is required!" })}
          className="inputStyle"
        />
      </div>

      <div className='flex flex-col md:flex-row items-center justify-between gap-4'>
        <div className='w-full'>
          <span className='labelStyles'>Country</span>
          <Countries />
        </div>
        <div className='w-full'>
          <span className='labelStyles'>Currency</span>
          <select className='inputStyles' disabled>
            <option>{selectedCountry?.currency || user?.currency}</option>
          </select>
        </div>
      </div>

      <div className='w-full flex items-center justify-between pt-10'>
        <div>
          <p className='text-lg text-black dark:text-gray-400 font-semibold'>
            Appearance
          </p>
          <span className='labelStyles'>
            Customize how your theme looks on your device.
          </span>
        </div>
        <div className='w-28 md:w-40'>
          <select
            className='inputStyles'
            defaultValue={theme}
            onChange={(e) => toggleTheme(e.target.value)}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </div>

      <div className='flex items-center gap-6 justify-end pb-10'>
        <Button
          variant='outline'
          loading={loading}
          type="reset"
          className="px-6 bg-transparent text-black dark:text-white dark:bg-gray-800"
        >
          Reset
        </Button>
        <Button
          loading={loading}
          type="submit"
          className="px-8 bg-violet-800 text-white"
        >
          {loading ? <BiLoader className='animate-spin' /> : "Save"}
        </Button>
      </div>
    </form>
  );
};

export default SettingsForm;
