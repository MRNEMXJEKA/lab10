const API_URL = "https://jsonplaceholder.typicode.com/todos?userId=2";

// Компонент картки бажання: отримує дані лише через props,
// а клік по чекбоксу «Придбано» передає батьківському компоненту подію toggle(id)
const WishItem = {
  props: {
    id: { type: Number, required: true },
    name: { type: String, required: true },
    price: { type: Number, default: null },
    priority: { type: String, default: "середній" },
    image: { type: String, default: "" },
    bought: { type: Boolean, default: false },
  },
  emits: ["toggle"],
  template: `
    <article
      class="wish"
      :class="{ 'priority-high': priority === 'високий', bought: bought }"
      :data-priority="priority"
    >
      <img v-if="image" :src="image" :alt="name" />
      <h3 class="wish__name">{{ name }}</h3>
      <p v-if="price !== null" class="wish__price">{{ price.toFixed(2) }} грн</p>
      <p class="wish__priority-label">Пріоритет: {{ priority }}</p>
      <label class="wish__bought">
        <input type="checkbox" :checked="bought" @change="$emit('toggle', id)" />
        Придбано
      </label>
    </article>
  `,
};

// Кореневий компонент: зберігає масив бажань у реактивному стані data()
Vue.createApp({
  components: { WishItem },

  data() {
    return {
      wishes: [
        {
          id: 1,
          name: "Новий ноутбук",
          price: 109999,
          priority: "високий",
          bought: false,
          image:
            "https://content.rozetka.com.ua/goods/images/big/677460228.jpg",
        },
        {
          id: 2,
          name: "Навушники",
          price: 3399,
          priority: "середній",
          bought: false,
          image:
            "https://content.rozetka.com.ua/goods/images/big/595395804.jpg",
        },
        {
          id: 3,
          name: "Книга з програмування",
          price: 1500,
          priority: "низький",
          bought: false,
          image:
            "https://work.njae.me.uk/content/images/size/w2000/2018/04/grokking-algorithms.png",
        },
      ],
      newName: "",
      newPrice: null,
      newPriority: "середній",
      loading: false,
      statusText: "",
      isError: false,
    };
  },

  // Обчислювана сума: перераховується автоматично при кожній зміні масиву
  computed: {
    total() {
      return this.wishes.reduce((sum, wish) => sum + (wish.price || 0), 0);
    },
  },

  methods: {
    // Обробник події toggle від WishItem: перемикає «придбано» для бажання з цим id
    toggle(id) {
      const wish = this.wishes.find((w) => w.id === id);
      wish.bought = !wish.bought;
    },

    // Додає нове бажання з форми (submit без перезавантаження завдяки @submit.prevent)
    addWish() {
      if (this.newName === "") {
        return;
      }
      this.wishes.push({
        id: Date.now(),
        name: this.newName,
        price: this.newPrice,
        priority: this.newPriority,
        bought: false,
      });
      this.newName = "";
      this.newPrice = null;
      this.newPriority = "середній";
    },

    // Перевіряє ціну під час введення: від'ємне значення -> власне повідомлення
    validatePrice(event) {
      const input = event.target;
      if (input.value !== "" && Number(input.value) < 0) {
        input.setCustomValidity("Ціна не може бути від'ємною");
        input.reportValidity();
      } else {
        input.setCustomValidity("");
      }
    },

    // Завантажує бажання з API JSONPlaceholder (https://jsonplaceholder.typicode.com/todos?userId=2)
    async loadData() {
      this.loading = true;
      this.isError = false;
      this.statusText = "Завантаження…";

      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();

        const apiWishes = data.map((todo) => ({
          id: todo.id,
          name: todo.title,
          price: null,
          priority: "середній",
          bought: todo.completed,
          fromApi: true,
        }));

        this.wishes = [...this.wishes.filter((w) => !w.fromApi), ...apiWishes];
        this.statusText = "";
      } catch (error) {
        this.isError = true;
        this.statusText =
          error instanceof TypeError
            ? "Список бажань недоступний офлайн"
            : "Не вдалося завантажити список бажань. Спробуйте пізніше";
        console.error("Помилка завантаження списку бажань:", error);
      } finally {
        this.loading = false;
      }
    },
  },

  mounted() {
    this.loadData();
  },
}).mount("#app");

/*
  Функцію ручного рендеру з практикуму 7 замінено компонентом WishItem і директивою v-for.
  Vue сам створює й оновлює картки, тому querySelector, createElement та innerHTML
  для списку більше не потрібні.

function renderWishes(items) {
  listContainer.innerHTML = '';
  items.forEach((wish, index) => {
    const card = document.createElement('article');
    ...
    listContainer.append(card);
  });
}
*/