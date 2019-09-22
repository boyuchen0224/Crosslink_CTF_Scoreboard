# Ethernaut_event_log
[Score_board Link](http://3.15.185.61:3000/)

監聽使用者在 [Ethernaut](https://ethernaut.openzeppelin.com) 上的 Level 完成關卡總和＋時間排名(用Block Number排)

環境部署：
1. node 11.0.0
2. mysql 5.5.62
3. import score_board.sql(`mysql -u username -p dbname < score_board.sql`
)`
4. create **.env** file 

```DB_HOST=YOURHOST
DB_USER=YOURUSER
DB_PASSWORD=YOURPASSWORD
DB_DATABASE=YOURDATABASE```

5. `npm install` 安裝套件
6. `node index.js` (port 3000)
    


**尚未整理分層架構**
